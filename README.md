# FinGuard Twin AI

FinGuard Twin AI is an AI-powered fintech risk simulation prototype designed to help teams evaluate product decisions before they become fraud, compliance, user trust, or operational problems.

The project addresses a key pain point in fintech: companies need to move fast, but every product decision can create hidden risk. For example, increasing transfer limits may support growth but also increase mule account abuse. Automating loan approvals may improve efficiency but may also create explainability, fairness, and compliance concerns. Stricter fraud rules may reduce scams but may also block legitimate customers.

These risks are highly relevant to fintech companies because they directly affect financial safety, customer trust, regulatory readiness, and operational workload. If risks are only discovered after launch, the company may face fraud losses, complaints, support pressure, compliance review, and reputational damage.

FinGuard Twin AI helps solve this by providing a pre-launch simulation environment. Users input a proposed fintech decision, and the app generates a structured risk assessment covering fraud abuse scenarios, false positive impact, compliance concerns, operational risks, control recommendations, and safer alternatives.

The expected result is earlier risk visibility, better decision-making, stronger internal communication between product, risk, compliance, and operations teams, and safer fintech product launches.

---

## Problem Statement

Fintech companies often need to launch new features quickly, such as increasing transfer limits, automating loan approvals, or changing KYC requirements. However, these decisions usually involve difficult trade-offs:

- Reducing fraud while avoiding unnecessary blocking of legitimate users
- Improving onboarding speed while maintaining strong KYC controls
- Using automation while keeping decisions explainable
- Supporting business growth while managing compliance and reputation risk

Without a structured pre-launch risk review, companies may only discover these problems after customers, operations teams, or compliance teams are already affected.

---

## Solution Overview

FinGuard Twin AI provides a pre-launch risk simulation environment for fintech product decisions.

Instead of only checking risk after a product has already been launched, the app creates a “risk twin” of the proposed decision before it goes live. This means the team can test how a new policy, feature, or automation rule may behave under fraud, compliance, customer experience, and operational pressure.

Users enter a proposed fintech decision, such as increasing transfer limits, automating loan approval, changing KYC rules, or tightening fraud detection rules. The system then evaluates the decision from multiple fintech risk perspectives and produces a structured assessment covering:

- How the decision could be abused by fraudsters
- Which legitimate users may be wrongly affected
- What compliance or audit concerns may appear
- What operational workload may increase
- What controls should be added before launch
- What safer alternative can reduce risk while still supporting business goals

The unique part of FinGuard Twin AI is that it does not simply say whether a decision is “good” or “bad”. It helps the team understand the trade-offs behind the decision and suggests a safer launch path. For example, instead of rejecting a higher transfer limit completely, the app may recommend staged limits, stronger KYC, step-up verification, transaction monitoring, and manual review for high-risk cases.

This makes the system useful for product, risk, compliance, and operations teams because it turns a risky product idea into a clear, reviewable risk report before real customers are affected.
---

## Key Features

- **New Simulation**  
  Allows users to input proposed fintech decisions for risk evaluation.

- **Dual Risk Engine**  
  Uses Gemini AI as the primary risk assessment engine, with a fallback rule-based engine when the AI engine is unavailable.

- **Risk Dashboard**  
  Displays the final risk rating, risk score, main concern, and launch recommendation.

- **Risk Matrix**  
  Maps likelihood, impact, and severity across different risk categories.

- **Deep-Dive Risk Analysis**  
  Provides fraud abuse scenarios, false positive impacts, compliance concerns, and operational risks.

- **Control Plan**  
  Suggests practical controls such as step-up verification, transaction monitoring, manual review, audit trails, staged limits, and customer protection measures.

- **Safer Alternative Decision**  
  Recommends a safer version of the original fintech decision.

- **History**  
  Saves previous simulations locally using `localStorage`.

- **Export Report**  
  Allows users to download a complete `.txt` risk assessment report.

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Storage:** localStorage
- **AI Integration:** Gemini API
- **Fallback Logic:** Rule-based risk engine
- **Deployment:** Vercel

---
---
## Run Online

You can access the deployed version directly through Vercel:

```text
https://finguard-twin-ai.vercel.app/
