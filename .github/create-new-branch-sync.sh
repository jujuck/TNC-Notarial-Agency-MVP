#!/usr/bin/env bash
# ============================================================
#  create-new-branch-sync — Pipeline interactif Git + GitHub (GitHub CLI)
#  Labels : uniquement les labels par défaut de GitHub
#  Usage : bash .github/create-new-branch-sync.sh
# ============================================================
set -euo pipefail

# ── Couleurs terminal ────────────────────────────────────────
RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'
CYAN='\033[0;36m'; MAGENTA='\033[0;35m'; BOLD='\033[1m'
DIM='\033[2m'; NC='\033[0m'

info()    { echo -e "\n${CYAN}❯${NC} $*"; }
success() { echo -e "${GREEN}✔${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $*"; }
die()     { echo -e "\n${RED}✖ ERREUR :${NC} $*\n" >&2; exit 1; }
sep()     { echo -e "${DIM}────────────────────────────────────────${NC}"; }

# ── Variables globales de retour (évite les sous-shells) ─────
PICK_RESULT=""
PROMPT_RESULT=""
CONFIRM_RESULT=""

to_lower() { echo "$1" | tr '[:upper:]' '[:lower:]'; }
to_upper() { echo "$1" | tr '[:lower:]' '[:upper:]'; }

pick_from_list() {
  local prompt_msg="$1"; shift
  local options=("$@")
  echo -e "\n${BOLD}${MAGENTA}?${NC} ${BOLD}${prompt_msg}${NC}"
  for i in "${!options[@]}"; do
    printf "  ${CYAN}%2d)${NC} %s\n" "$((i+1))" "${options[$i]}"
  done
  local choice
  while true; do
    printf "\n  ${CYAN}▸${NC} Choix [1-%d] : " "${#options[@]}"
    read -r choice < /dev/tty
    if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= ${#options[@]} )); then
      PICK_RESULT="$((choice-1))"
      return
    fi
    warn "Saisis un numéro entre 1 et ${#options[@]}."
  done
}

prompt() {
  local label="$1" default="${2:-}"
  if [[ -n "$default" ]]; then
    printf "  ${CYAN}▸${NC} %s ${DIM}[%s]${NC} : " "$label" "$default"
  else
    printf "  ${CYAN}▸${NC} %s : " "$label"
  fi
  local var
  read -r var < /dev/tty
  PROMPT_RESULT="${var:-$default}"
}

confirm() {
  local msg="$1" default="${2:-o}"
  local hint="[O/n]"; [[ "$default" == "n" ]] && hint="[o/N]"
  printf "\n  ${CYAN}▸${NC} %s %s : " "$msg" "$hint"
  local r
  read -r r < /dev/tty
  r="$(to_lower "${r:-$default}")"
  if [[ "$r" == "o" || "$r" == "oui" || "$r" == "y" || "$r" == "yes" ]]; then
    CONFIRM_RESULT="yes"
  else
    CONFIRM_RESULT="no"
  fi
}

# ── Labels (par défaut de GitHub) ────────────────────────────
# Correspondance type de commit → label GitHub par défaut.
# Les types sans équivalent (test, style, chore, perf, ci) n'ont pas de label auto.
get_type_label() {
  case "$1" in
    feat|refactor|clean) echo "enhancement" ;;
    fix)                 echo "bug" ;;
    docs)                echo "documentation" ;;
    *)                   echo "" ;;
  esac
}

has_label() {  # le label existe-t-il dans le dépôt ?
  echo "$EXISTING_LABELS_JSON" | jq -e --arg n "$1" 'any(.[]; .name==$n)' >/dev/null
}

in_issue_labels() {  # déjà sélectionné ?
  local l
  for l in ${ISSUE_LABELS[@]+"${ISSUE_LABELS[@]}"}; do
    [[ "$l" == "$1" ]] && return 0
  done
  return 1
}

add_label() {
  local name="$1"
  if in_issue_labels "$name"; then return; fi
  if has_label "$name"; then
    ISSUE_LABELS+=("$name")
  else
    warn "Le label '$name' n'existe pas dans ce dépôt — ignoré."
  fi
}

# ── Prérequis ────────────────────────────────────────────────
for cmd in gh git jq; do
  command -v "$cmd" &>/dev/null || die "'$cmd' est requis mais introuvable."
done
gh auth status &>/dev/null || die "gh non authentifié — lance 'gh auth login'."
git rev-parse --is-inside-work-tree &>/dev/null || die "Pas dans un dépôt Git."
gh repo view &>/dev/null || die "Aucun dépôt GitHub détecté (remote 'origin' ?). Essaie 'gh repo set-default'."

BASE_BRANCH=$(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name')

# ── Données statiques ────────────────────────────────────────
CC_TYPES=(feat fix refactor test docs style chore perf clean ci)
# Labels par défaut de GitHub
DEFAULT_LABELS=(
  "bug" "documentation" "duplicate" "enhancement"
  "good first issue" "help wanted" "invalid" "question" "wontfix"
)
PR_TEMPLATE_FILE=".github/pull_request_template.md"

# ════════════════════════════════════════════════════════════
clear
echo -e "${BOLD}"
echo "  ╔════════════════════════════════════════╗"
echo "  ║          gh-new  —  GitHub Flow        ║"
echo "  ╚════════════════════════════════════════╝"
echo -e "${NC}"

# ── [1/5] BRANCHE ───────────────────────────────────────────
echo -e "\n${BOLD}  [1/5]  Branche${NC}"; sep

pick_from_list "Type (conventional commits) :" "${CC_TYPES[@]}"
TYPE="${CC_TYPES[$PICK_RESULT]}"
success "Type : ${BOLD}${TYPE}${NC}"

echo -e "\n${BOLD}${MAGENTA}?${NC} ${BOLD}Numéro de sprint${NC}"
prompt "Sprint" "S$(date +%V)"
SPRINT="$(to_upper "$PROMPT_RESULT")"
success "Sprint : ${BOLD}${SPRINT}${NC}"

echo -e "\n${BOLD}${MAGENTA}?${NC} ${BOLD}Description courte${NC}"
echo -e "  ${DIM}Ex : authentification-oauth  /  fix-crash-demarrage${NC}"
prompt "Description"
DESC_RAW="$PROMPT_RESULT"
[[ -z "$DESC_RAW" ]] && die "La description ne peut pas être vide."

SLUG="$(echo "$DESC_RAW" | iconv -t ascii//TRANSLIT 2>/dev/null || echo "$DESC_RAW")"
SLUG="$(echo "$SLUG" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' \
        | tr -cd '[:alnum:]-' | sed 's/-\+/-/g; s/^-//; s/-$//')"
BRANCH="${TYPE}/${SPRINT}-${SLUG}"

echo -e "\n  ${DIM}Branche générée :${NC} ${CYAN}${BOLD}${BRANCH}${NC}"
confirm "Confirmer ce nom ?"
if [[ "$CONFIRM_RESULT" == "no" ]]; then
  echo -e "\n${BOLD}${MAGENTA}?${NC} ${BOLD}Nom de branche personnalisé${NC}"
  prompt "Branche"
  BRANCH="$PROMPT_RESULT"
  [[ -z "$BRANCH" ]] && die "Nom de branche vide."
fi

if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  die "La branche '${BRANCH}' existe déjà localement."
fi

# ── [2/5] MILESTONE ─────────────────────────────────────────
echo -e "\n\n${BOLD}  [2/5]  Milestone${NC}"; sep

info "Chargement des milestones ouvertes…"
MILESTONES_JSON=$(gh api "repos/{owner}/{repo}/milestones?state=open&per_page=20" 2>/dev/null || echo "[]")

MILESTONE_TITLES=()
while IFS= read -r line; do
  [[ -n "$line" ]] && MILESTONE_TITLES+=("$line")
done < <(echo "$MILESTONES_JSON" | jq -r '.[].title')

# NB : sur GitHub, 'gh issue/pr create --milestone' attend le TITRE (pas l'id)
MILESTONE_TITLE=""

confirm "Créer une nouvelle milestone ?"
if [[ "$CONFIRM_RESULT" == "yes" ]]; then
  echo -e "\n${BOLD}${MAGENTA}?${NC} ${BOLD}Titre de la milestone${NC}"
  prompt "Titre" "${SPRINT} — $(date +%Y)"
  MILESTONE_TITLE="$PROMPT_RESULT"
  if gh api --method POST "repos/{owner}/{repo}/milestones" \
       -f title="${MILESTONE_TITLE}" &>/dev/null; then
    success "Milestone créée : ${BOLD}${MILESTONE_TITLE}${NC}"
  else
    warn "Création impossible (titre déjà existant ?) — on tente de l'utiliser telle quelle."
  fi
elif [[ ${#MILESTONE_TITLES[@]} -gt 0 ]]; then
  pick_from_list "Associer à une milestone existante :" "${MILESTONE_TITLES[@]}"
  MILESTONE_TITLE="${MILESTONE_TITLES[$PICK_RESULT]}"
  success "Milestone : ${BOLD}${MILESTONE_TITLE}${NC}"
else
  warn "Aucune milestone ouverte — issue sans milestone."
fi

# ── [3/5] BRANCHE GIT ───────────────────────────────────────
echo -e "\n\n${BOLD}  [3/5]  Branche Git${NC}"; sep

info "Création locale de '${BRANCH}'…"
git checkout -b "${BRANCH}" || die "Impossible de créer la branche."

# GitHub refuse une PR sans aucun commit d'écart avec la branche de base :
# on crée donc un commit vide d'initialisation.
info "Commit d'initialisation (vide)…"
git commit --allow-empty -m "chore: initialise ${BRANCH}" >/dev/null \
  || die "Impossible de créer le commit initial."

info "Push vers origin…"
git push -u origin "${BRANCH}" || die "Impossible de pusher."
success "Branche ${CYAN}${BRANCH}${NC} disponible sur origin."

# ── [4/5] ISSUE ─────────────────────────────────────────────
echo -e "\n\n${BOLD}  [4/5]  Issue${NC}"; sep

echo -e "\n${BOLD}${MAGENTA}?${NC} ${BOLD}Titre de l'issue${NC}"
echo -e "  ${DIM}(Entrée pour reprendre la description de branche)${NC}"
prompt "Titre" "$DESC_RAW"
ISSUE_TITLE="$PROMPT_RESULT"

EXISTING_LABELS_JSON=$(gh label list --limit 200 --json name 2>/dev/null || echo "[]")

ISSUE_LABELS=()

# Label automatique selon le type de commit
TYPE_LBL=$(get_type_label "$TYPE")
if [[ -n "$TYPE_LBL" ]]; then
  add_label "$TYPE_LBL"
  in_issue_labels "$TYPE_LBL" && success "Label automatique : ${BOLD}${TYPE_LBL}${NC}"
fi

# Labels supplémentaires (optionnels)
while true; do
  pick_from_list "Ajouter un label ? (sélection : ${ISSUE_LABELS[*]:-aucune})" \
    "✔ Terminer" "${DEFAULT_LABELS[@]}"
  [[ "$PICK_RESULT" -eq 0 ]] && break
  add_label "${DEFAULT_LABELS[$((PICK_RESULT-1))]}"
done

ISSUE_ARGS=(--title "${ISSUE_TITLE}" --body "<!-- créée automatiquement par gh-new -->")
for l in ${ISSUE_LABELS[@]+"${ISSUE_LABELS[@]}"}; do ISSUE_ARGS+=(--label "$l"); done
[[ -n "$MILESTONE_TITLE" ]] && ISSUE_ARGS+=(--milestone "$MILESTONE_TITLE")

ISSUE_OUTPUT=$(gh issue create "${ISSUE_ARGS[@]}" 2>&1) \
  || die "Échec création issue.\n${ISSUE_OUTPUT}"

# gh affiche l'URL de l'issue : https://github.com/OWNER/REPO/issues/42
ISSUE_URL=$(echo "$ISSUE_OUTPUT" | grep -oE 'https://[^ ]+/issues/[0-9]+' | tail -1 || true)
[[ -z "$ISSUE_URL" ]] && die "Impossible d'extraire l'URL de l'issue.\n${ISSUE_OUTPUT}"
ISSUE_ID="${ISSUE_URL##*/}"

success "Issue ${BOLD}#${ISSUE_ID}${NC} créée : ${ISSUE_TITLE}"

# ── [5/5] DRAFT PULL REQUEST ────────────────────────────────
echo -e "\n\n${BOLD}  [5/5]  Draft Pull Request${NC}"; sep

echo -e "\n${BOLD}${MAGENTA}?${NC} ${BOLD}Titre de la PR${NC}"
prompt "Titre PR" "${TYPE}: ${ISSUE_TITLE}"
PR_TITLE="$PROMPT_RESULT"

if [[ -f "${PR_TEMPLATE_FILE}" ]]; then
  PR_BODY=$(cat "${PR_TEMPLATE_FILE}")
  success "Template '${PR_TEMPLATE_FILE}' utilisé."
else
  warn "Template '${PR_TEMPLATE_FILE}' introuvable — fallback minimal."
  PR_BODY="## Description

<!-- Décris tes changements -->

## Checklist

- [ ] Tests
- [ ] Documentation
- [ ] Revue de code"
fi

PR_DESC="${PR_BODY}

---
_Créé par **gh-new** le $(date '+%Y-%m-%d')_

Closes #${ISSUE_ID}"

# Les mêmes labels que l'issue sont appliqués à la PR
PR_ARGS=(--draft --title "${PR_TITLE}" --body "${PR_DESC}"
         --head "${BRANCH}" --base "${BASE_BRANCH}")
for l in ${ISSUE_LABELS[@]+"${ISSUE_LABELS[@]}"}; do PR_ARGS+=(--label "$l"); done
[[ -n "$MILESTONE_TITLE" ]] && PR_ARGS+=(--milestone "$MILESTONE_TITLE")

PR_OUTPUT=$(gh pr create "${PR_ARGS[@]}" 2>&1) \
  || die "Échec création PR.\n${PR_OUTPUT}"

PR_URL=$(echo "$PR_OUTPUT" | grep -oE 'https://[^ ]+/pull/[0-9]+' | tail -1 || true)

# ── RÉSUMÉ ──────────────────────────────────────────────────
LABELS_CSV="$(IFS=','; echo "${ISSUE_LABELS[*]-}")"

echo ""; sep
echo -e "${GREEN}${BOLD}"
echo "  ✔  Pipeline initialisé avec succès !"
echo -e "${NC}"; sep
printf "  %-12s : ${CYAN}%s${NC}\n"  "Branche"   "${BRANCH}"
printf "  %-12s : #%s\n"             "Issue"      "${ISSUE_ID}"
printf "  %-12s : %s\n"              "Milestone"  "${MILESTONE_TITLE:-—}"
printf "  %-12s : %s\n"              "Labels"     "${LABELS_CSV:-—}"
[[ -n "${PR_URL:-}" ]] && \
printf "  %-12s : %s\n"              "Draft PR"   "${PR_URL}"
sep
echo ""
echo -e "  ${YELLOW}Prochaines étapes :${NC}"
echo -e "  1. Code → commits conventionnels sur '${BRANCH}'"
echo -e "  2. Quand la PR est prête : ${BOLD}gh pr ready${NC} (retire le statut Draft)"
echo ""
