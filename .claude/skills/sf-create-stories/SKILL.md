---
name: sf-create-stories
description: "Break an epic into shippable user stories with acceptance criteria, using the project's story template."
argument-hint: "[epic-file-or-name]"
user-invocable: true
allowed-tools: Read, Glob, Write, AskUserQuestion
model: sonnet
agent: delivery-lead
---

## Phase 1: Read the epic

Locate the epic file (argument or under `production/epics/` / `docs/epics/`). If none exists, ask the user to describe the epic in 1–3 paragraphs first.

## Phase 2: Read the story template

Load `.claude/docs/templates/user-story.md`.

## Phase 3: Draft stories (collaborative)

Propose 3–8 stories that decompose the epic. For each story, draft:
- Title (imperative form)
- User-as-X / does-Y / so-that-Z
- Acceptance criteria (3–7 bullets)
- Dependencies on other stories
- Estimate (T-shirt or story points; ask user for the team's convention)

**Show the list to the user. Do not write files yet.** Ask: "Which of these should I create?"

## Phase 4: Write approved stories

For each approved story, write `production/stories/<epic>/<story-id>-<slug>.md` using the template.

## Phase 5: Update epic with story links

Append a `## Stories` section to the epic file linking the new story files.
