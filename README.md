# FinGuard Twin AI

FinGuard Twin AI helps fintech teams test decisions before they become fraud, compliance, user trust, or operational problems. 

This app is an AI-powered risk simulator that acts as a decision-support prototype, helping teams explore the possible risks of a new product decision, KYC change, or transaction policy before it goes live.

## Problem Statement
Fintech teams often need to launch decisions quickly, such as increasing transfer limits or automating loan approvals. However, they frequently face difficult trade-offs:
* Reducing fraud vs. blocking legitimate users
* Faster onboarding vs. weaker KYC
* Automation vs. explainability
* Growth vs. compliance risk

## Solution Overview
FinGuard Twin AI provides a pre-launch testing environment. Users input a proposed fintech decision, and the system generates a structured risk assessment outlining potential fraud abuse, false positive impact, compliance gaps, and recommended controls. 

## Key Features
* **New Simulation:** Form to input proposed fintech decisions.
* **Dual Risk Engine:** Utilizes Gemini AI for primary risk assessment, with a reliable fallback rule-based engine.
* **Risk Dashboard:** Visualizes Risk Rating, Risk Score, and Main Concerns.
* **Risk Matrix:** Maps likelihood against potential impact.
* **Deep-Dive Analysis:** Details Fraud Abuse Scenarios and False Positive Impacts.
* **Actionable Advice:** Provides a Control Plan and a Safer Alternative decision.
* **History:** Saves previous simulations locally using `localStorage`.
* **Export Report:** Downloads a complete `.txt` risk report.

## Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS
* **Storage:** `localStorage`
* **AI & Logic:** Gemini API, Fallback Rule-Based Engine

## How to Run Locally

1. Clone the repository:
```bash
   git clone <repository-url>
   cd finguard-twin-ai
