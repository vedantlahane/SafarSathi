"""
Model 6: Alert Timing Optimizer

Decides WHEN to send safety alerts. Too early = false alarm fatigue.
Too late = useless.

LITE VERSION: Pure heuristic engine with logging for future RL training.
No neural network. Ships as rules, collects data to learn from later.

This is identical to what a production system would run on day 1
before any RL training data exists.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict
from pathlib import Path
from enum import Enum
from typing import Optional

import numpy as np

from config.settings import MODELS_DIR, ALERT_TIMING_PARAMS

MODEL_DIR = MODELS_DIR / "alert_timing"


class AlertAction(Enum):
    WAIT = "wait"
    SOFT_NUDGE = "soft_nudge"
    STANDARD_ALERT = "standard_alert"
    URGENT_ALERT = "urgent_alert"
    EMERGENCY = "emergency"


@dataclass
class AlertContext:
    """Everything the alert engine needs to make a decision."""
    safety_score: float
    score_change_rate_per_hour: float  # negative = declining
    score_variance: float              # volatility
    predicted_score_1h: float
    predicted_score_3h: float
    incident_type: Optional[str]
    incident_confidence: float
    is_night: bool
    hour: int
    battery_pct: float
    network_quality: int               # 4/3/2/0
    nearest_hospital_km: float
    time_since_last_alert_minutes: float
    alerts_last_24h: int
    anomaly_detected: bool
    anomaly_severity: str              # "none", "low", "medium", "high"


@dataclass
class AlertDecision:
    action: AlertAction
    reason: str
    confidence: float
    override: bool                     # True = hard safety rule, not learned
    context_snapshot: Optional[dict] = None


class AlertTimingEngine:
    """
    Heuristic alert timing with experience logging.

    HARD OVERRIDES: never suppressed, never learned
    - Score < 15 → EMERGENCY
    - Score < 25 + rapid decline → EMERGENCY
    - Battery critical + no network → URGENT
    - High-confidence accident → URGENT

    LEARNED DECISIONS (future): gray zone between 30-65
    - When to nudge vs wait
    - How to balance alert fatigue vs safety
    - Optimal alert frequency per user behavior

    For now: heuristics handle the gray zone.
    Experience buffer collects data for future RL training.
    """

    def __init__(self):
        self.experience_buffer: list[dict] = []
        self.max_buffer_size = 10000

    def decide(self, context: AlertContext) -> AlertDecision:
        """Main decision function."""

        score = context.safety_score
        rate = context.score_change_rate_per_hour
        predicted_1h = context.predicted_score_1h
        since_last = context.time_since_last_alert_minutes

        # ─── HARD OVERRIDES (non-negotiable) ───

        if score < 15:
            return AlertDecision(
                action=AlertAction.EMERGENCY,
                reason="Safety score critically low",
                confidence=1.0,
                override=True,
            )

        if score < 25 and rate < -10:
            return AlertDecision(
                action=AlertAction.EMERGENCY,
                reason="Critical score with rapid decline",
                confidence=0.95,
                override=True,
            )

        if context.battery_pct < 5 and context.network_quality == 0:
            return AlertDecision(
                action=AlertAction.URGENT_ALERT,
                reason="About to lose all connectivity",
                confidence=0.95,
                override=True,
            )

        if (context.incident_type == "road_accident" and
                context.incident_confidence > 0.7 and score < 40):
            return AlertDecision(
                action=AlertAction.URGENT_ALERT,
                reason="Possible accident detected with high confidence",
                confidence=context.incident_confidence,
                override=True,
            )

        if context.anomaly_severity == "high" and score < 35:
            return AlertDecision(
                action=AlertAction.URGENT_ALERT,
                reason="High severity anomaly in danger zone",
                confidence=0.85,
                override=True,
            )

        # ─── HEURISTIC DECISIONS (gray zone) ───

        # Rapid decline
        if rate < -15:
            if score < 40:
                return self._log_decision(context, AlertAction.URGENT_ALERT,
                                          "Rapid safety decline in danger zone", 0.8)
            if since_last > 10:
                return self._log_decision(context, AlertAction.STANDARD_ALERT,
                                          "Safety declining rapidly", 0.7)

        # Moderate decline approaching danger
        if rate < -5 and score < 50:
            if since_last > 20:
                return self._log_decision(context, AlertAction.STANDARD_ALERT,
                                          "Gradual decline toward danger zone", 0.65)

        # Predicted to enter danger zone
        if predicted_1h < 35 and score > 45:
            if since_last > 30:
                return self._log_decision(context, AlertAction.SOFT_NUDGE,
                                          f"Safety may drop to {predicted_1h:.0f} in ~1 hour", 0.6)

        # Predicted 3h danger
        if context.predicted_score_3h < 25 and score > 50:
            if since_last > 60:
                return self._log_decision(context, AlertAction.SOFT_NUDGE,
                                          "Conditions may deteriorate significantly in 3 hours", 0.5)

        # Low but stable — periodic reminder
        if score < 35:
            if since_last > 30:
                return self._log_decision(context, AlertAction.SOFT_NUDGE,
                                          "Sustained low safety score", 0.55)

        # Anomaly detected but score not terrible
        if context.anomaly_detected and score < 60:
            if since_last > 20:
                return self._log_decision(context, AlertAction.SOFT_NUDGE,
                                          "Unusual conditions detected", 0.5)

        # Night + moderate risk
        if context.is_night and score < 50 and since_last > 45:
            return self._log_decision(context, AlertAction.SOFT_NUDGE,
                                      "Moderate risk during nighttime", 0.45)

        # Everything fine
        return self._log_decision(context, AlertAction.WAIT,
                                  "Monitoring — no action needed", 0.9)

    def _log_decision(
        self,
        context: AlertContext,
        action: AlertAction,
        reason: str,
        confidence: float,
    ) -> AlertDecision:
        """Make decision and log for future RL training."""
        decision = AlertDecision(
            action=action,
            reason=reason,
            confidence=confidence,
            override=False,
            context_snapshot=asdict(context),
        )

        # Store in experience buffer (for future RL training)
        self.experience_buffer.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "context": asdict(context),
            "action": action.value,
            "confidence": confidence,
            # outcome will be filled in later when we know what happened
            "outcome": None,
        })

        # Cap buffer size
        if len(self.experience_buffer) > self.max_buffer_size:
            self.experience_buffer = self.experience_buffer[-self.max_buffer_size:]

        return decision

    def record_outcome(self, decision_index: int, outcome: dict):
        """
        Record what actually happened after a decision.
        This data trains the future RL model.

        outcome keys:
        - score_after_1h: float
        - incident_occurred: bool
        - user_responded: bool (did they act on the alert)
        - user_dismissed: bool
        - was_useful: bool (subjective, from user feedback)
        """
        if 0 <= decision_index < len(self.experience_buffer):
            self.experience_buffer[decision_index]["outcome"] = outcome

    def save_experience(self):
        """Save experience buffer for future RL training."""
        MODEL_DIR.mkdir(parents=True, exist_ok=True)

        buffer_path = MODEL_DIR / "experience_buffer.json"
        with open(buffer_path, "w") as f:
            json.dump(self.experience_buffer, f, indent=2)

        print(f"Saved {len(self.experience_buffer)} experiences to {buffer_path}")

    def get_decision_stats(self) -> dict:
        """Summary statistics of decisions made."""
        if not self.experience_buffer:
            return {"total_decisions": 0}

        actions = [e["action"] for e in self.experience_buffer]
        from collections import Counter
        counts = Counter(actions)

        return {
            "total_decisions": len(self.experience_buffer),
            "action_distribution": dict(counts),
            "override_count": sum(1 for e in self.experience_buffer
                                  if e.get("context", {}).get("safety_score", 100) < 25),
        }


def save_alert_model():
    """Save the alert timing model (parametric — just the engine config)."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    metadata = {
        "model_type": "heuristic_with_experience_logging",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "action_space": [a.value for a in AlertAction],
        "hard_override_thresholds": {
            "emergency_score": 15,
            "emergency_score_declining": 25,
            "critical_battery_no_network": 5,
            "accident_confidence": 0.7,
        },
        "heuristic_thresholds": {
            "rapid_decline_rate": -15,
            "moderate_decline_rate": -5,
            "danger_zone_score": 35,
            "caution_zone_score": 50,
            "min_alert_interval_minutes": 10,
        },
        "future_rl": {
            "status": "collecting_experience",
            "min_samples_to_train": 500,
            "context_dim": ALERT_TIMING_PARAMS["context_dim"],
        },
    }

    with open(MODEL_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Alert timing model saved to {MODEL_DIR}")
    return metadata


def test_alert_timing():
    """Test the alert engine on various scenarios."""
    engine = AlertTimingEngine()

    test_cases = [
        {
            "name": "Safe and stable",
            "context": AlertContext(
                safety_score=78, score_change_rate_per_hour=1.0,
                score_variance=3.0, predicted_score_1h=76, predicted_score_3h=74,
                incident_type=None, incident_confidence=0.0,
                is_night=False, hour=14, battery_pct=80, network_quality=4,
                nearest_hospital_km=2, time_since_last_alert_minutes=999,
                alerts_last_24h=0, anomaly_detected=False, anomaly_severity="none",
            ),
            "expected_action": AlertAction.WAIT,
        },
        {
            "name": "Critical score",
            "context": AlertContext(
                safety_score=12, score_change_rate_per_hour=-20,
                score_variance=15.0, predicted_score_1h=5, predicted_score_3h=3,
                incident_type="flood", incident_confidence=0.8,
                is_night=True, hour=2, battery_pct=15, network_quality=2,
                nearest_hospital_km=20, time_since_last_alert_minutes=5,
                alerts_last_24h=2, anomaly_detected=True, anomaly_severity="high",
            ),
            "expected_action": AlertAction.EMERGENCY,
        },
        {
            "name": "Declining toward danger",
            "context": AlertContext(
                safety_score=52, score_change_rate_per_hour=-8,
                score_variance=6.0, predicted_score_1h=42, predicted_score_3h=30,
                incident_type=None, incident_confidence=0.0,
                is_night=False, hour=16, battery_pct=60, network_quality=4,
                nearest_hospital_km=5, time_since_last_alert_minutes=45,
                alerts_last_24h=0, anomaly_detected=False, anomaly_severity="none",
            ),
            "expected_action": AlertAction.STANDARD_ALERT,
        },
        {
            "name": "Battery dying, no signal",
            "context": AlertContext(
                safety_score=45, score_change_rate_per_hour=-2,
                score_variance=4.0, predicted_score_1h=43, predicted_score_3h=40,
                incident_type=None, incident_confidence=0.0,
                is_night=True, hour=23, battery_pct=3, network_quality=0,
                nearest_hospital_km=15, time_since_last_alert_minutes=30,
                alerts_last_24h=1, anomaly_detected=True, anomaly_severity="medium",
            ),
            "expected_action": AlertAction.URGENT_ALERT,
        },
    ]

    print("\n" + "=" * 60)
    print("  Alert Timing Engine — Test Cases")
    print("=" * 60)

    passed = 0
    for tc in test_cases:
        decision = engine.decide(tc["context"])
        ok = decision.action == tc["expected_action"]
        status = "✅" if ok else "❌"
        passed += int(ok)
        print(f"\n  {status} {tc['name']}")
        print(f"     Score: {tc['context'].safety_score}, Rate: {tc['context'].score_change_rate_per_hour}/h")
        print(f"     Action: {decision.action.value} (expected: {tc['expected_action'].value})")
        print(f"     Reason: {decision.reason}")
        print(f"     Override: {decision.override}, Confidence: {decision.confidence:.2f}")

    print(f"\n  Passed: {passed}/{len(test_cases)}")

    stats = engine.get_decision_stats()
    print(f"\n  Decision stats: {stats}")


if __name__ == "__main__":
    save_alert_model()
    test_alert_timing()