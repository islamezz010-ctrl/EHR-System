"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, CheckCircle2, Circle, Calendar, User, Heart, Percent, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/lib/clinical-types";
import { cn } from "@/lib/utils";

type PatientTreatmentPlansProps = {
  patients: Patient[];
};

type TreatmentTask = {
  id: string;
  task: string;
  frequency: string;
  completed: boolean;
};

type TreatmentPlan = {
  id: string;
  title: string;
  condition: string;
  provider: string;
  startDate: string;
  targetDate: string;
  goals: string[];
  tasks: TreatmentTask[];
};

const selectClassName =
  "flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function PatientTreatmentPlans({ patients }: PatientTreatmentPlansProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(
    patients[0]?.id ?? "",
  );
  
  // Storing task completed states in component state so the user can toggle them interactively!
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (patients.length === 0) {
      setSelectedPatientId("");
      return;
    }
    if (!patients.some((p) => p.id === selectedPatientId)) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const patientIndex = patients.findIndex((p) => p.id === selectedPatientId);
  const selectedPatient = patients[patientIndex] ?? null;

  // Build a custom treatment plan based on patient chronic conditions
  const treatmentPlan = useMemo((): TreatmentPlan | null => {
    if (!selectedPatient) return null;

    const condition = selectedPatient.medicalProfile.chronicConditions[0] || "General Wellness";
    
    let title = "General Preventive Wellness Plan";
    let goals = ["Maintain healthy weight (BMI 18.5 - 24.9)", "Keep daily steps above 8,000", "Consume 5+ servings of fruits/vegetables"];
    let tasks: TreatmentTask[] = [
      { id: "task_1", task: "Perform 30 minutes of moderate aerobic exercise", frequency: "Daily", completed: false },
      { id: "task_2", task: "Log daily nutritional intake", frequency: "Daily", completed: false },
      { id: "task_3", task: "Log daily step count in wellness app", frequency: "Daily", completed: false },
    ];

    if (condition.includes("Hypertension")) {
      title = "Hypertension Care & Blood Pressure Control Plan";
      goals = [
        "Maintain average blood pressure below 130/80 mmHg",
        "Limit dietary sodium intake to under 2,000 mg daily",
        "Achieve consistent daily medication compliance"
      ];
      tasks = [
        { id: "task_1", task: "Measure and record blood pressure (Morning)", frequency: "Twice daily", completed: false },
        { id: "task_2", task: "Measure and record blood pressure (Evening)", frequency: "Twice daily", completed: false },
        { id: "task_3", task: "Take Lisinopril 20mg in the morning", frequency: "Daily", completed: false },
        { id: "task_4", task: "Follow low-sodium DASH diet guidelines", frequency: "Every meal", completed: false },
      ];
    } else if (condition.includes("Diabetes")) {
      title = "Diabetes Mellitus Glycemic Control Plan";
      goals = [
        "Maintain fasting blood glucose between 80 - 130 mg/dL",
        "Keep post-meal blood glucose below 180 mg/dL",
        "Target HbA1c below 7.0% (Current: 7.2%)"
      ];
      tasks = [
        { id: "task_1", task: "Check blood glucose level before breakfast", frequency: "Daily", completed: false },
        { id: "task_2", task: "Take Metformin 1000mg with breakfast", frequency: "Twice daily", completed: false },
        { id: "task_3", task: "Take Metformin 1000mg with dinner", frequency: "Twice daily", completed: false },
        { id: "task_4", task: "Complete foot exam for microvascular checks", frequency: "Daily", completed: false },
        { id: "task_5", task: "Aerobic exercise (brisk walking) for 30 minutes", frequency: "Daily", completed: false },
      ];
    } else if (condition.includes("Asthma")) {
      title = "Asthma Pulmonary Management Plan";
      goals = [
        "Prevent asthma exacerbations and emergency visits",
        "Avoid triggers (dust, cold air, high pollen counts)",
        "Maintain normal daily activity thresholds"
      ];
      tasks = [
        { id: "task_1", task: "Take maintenance Fluticasone inhaler (2 puffs)", frequency: "Twice daily", completed: false },
        { id: "task_2", task: "Measure peak flow rate in the morning", frequency: "Daily", completed: false },
        { id: "task_3", task: "Keep rescue Albuterol inhaler in bag/close reach", frequency: "Constant", completed: false },
      ];
    }

    return {
      id: `plan_${selectedPatient.id}`,
      title,
      condition,
      provider: "Dr. Elena Vasquez",
      startDate: "Jan 10, 2026",
      targetDate: "Jul 10, 2026",
      goals,
      tasks,
    };
  }, [selectedPatient]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const progressPercentage = useMemo(() => {
    if (!treatmentPlan) return 0;
    const total = treatmentPlan.tasks.length;
    const completed = treatmentPlan.tasks.filter((t) => completedTasks[t.id]).length;
    return Math.round((completed / total) * 100);
  }, [treatmentPlan, completedTasks]);

  if (!selectedPatient || !treatmentPlan) {
    return (
      <div className="p-5 text-center text-muted-foreground">No patient selected.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Active Treatment Plans</h2>
          <p className="text-sm text-muted-foreground">Structured care strategies, wellness targets, and daily self-care checklists</p>
        </div>
        <select
          value={selectedPatientId}
          onChange={(e) => {
            setSelectedPatientId(e.target.value);
            setCompletedTasks({});
          }}
          className={selectClassName}
          disabled={patients.length === 0}
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        {/* Daily Checklist and Tasks */}
        <div className="space-y-5">
          <Card className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card">
            <CardHeader className="p-0 pb-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="space-y-1">
                  <Badge className="border-0 bg-[#3d3bdc] text-white">Active Plan</Badge>
                  <CardTitle className="mt-2 text-lg font-bold">{treatmentPlan.title}</CardTitle>
                  <CardDescription>
                    Condition: <span className="font-semibold text-slate-800 dark:text-slate-200">{treatmentPlan.condition}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-5">
              {/* Progress bar visual */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-650 dark:text-slate-350">Daily Care Compliance</span>
                  <span className="font-bold text-teal-500">{progressPercentage}% Completed</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Task Checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Daily Self-Care Log</h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {treatmentPlan.tasks.map((task) => {
                    const isDone = completedTasks[task.id] || false;
                    return (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className="flex w-full items-start gap-3 py-3 text-left transition hover:bg-slate-50/50 dark:hover:bg-slate-900/10 cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-teal-500" />
                        ) : (
                          <Circle className="mt-0.5 size-5 shrink-0 text-slate-300 dark:text-slate-600" />
                        )}
                        <div>
                          <p className={cn("text-sm font-medium", isDone && "line-through text-muted-foreground")}>
                            {task.task}
                          </p>
                          <span className="mt-0.5 inline-block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            {task.frequency}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals and Details Info Panel */}
        <div className="space-y-5">
          <Card className="rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-card">
            <CardHeader>
              <CardTitle className="text-md font-bold">Plan Target Goals</CardTitle>
              <CardDescription>Clinical milestones set by provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {treatmentPlan.goals.map((goal, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Heart className="mt-0.5 size-4 text-rose-500 shrink-0" />
                    <span className="text-slate-650 dark:text-slate-350">{goal}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-slate-400" />
                  <span>Assigned Clinician: <strong className="text-foreground">{treatmentPlan.provider}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-slate-400" />
                  <span>Start Date: <strong className="text-foreground">{treatmentPlan.startDate}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-slate-400" />
                  <span>Target Evaluation: <strong className="text-foreground">{treatmentPlan.targetDate}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
