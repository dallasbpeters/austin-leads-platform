"use client";

import { useMemo, useState } from "react";

import { updateLaunchChecklistTaskStatus } from "@/services/admin/launch-checklist";

export function useLaunchChecklistManager(initialChecklist) {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [pendingTaskId, setPendingTaskId] = useState(null);
  const [error, setError] = useState("");

  const completion = useMemo(() => {
    const tasks = checklist?.sections?.flatMap((section) => section.tasks || []) || [];
    const completed = tasks.filter((task) => task.status === "done").length;

    return {
      total: tasks.length,
      completed,
    };
  }, [checklist]);

  async function setTaskStatus({ sectionKey, taskKey, status }) {
    if (!checklist?._id) {
      setError("Checklist document is missing an id.");
      return;
    }

    const taskId = `${sectionKey}:${taskKey}`;
    const previousChecklist = checklist;

    setPendingTaskId(taskId);
    setError("");
    setChecklist((current) => ({
      ...current,
      sections: current.sections?.map((section) =>
        section._key !== sectionKey
          ? section
          : {
              ...section,
              tasks: section.tasks?.map((task) =>
                task._key === taskKey ? { ...task, status } : task,
              ),
            },
      ),
    }));

    try {
      await updateLaunchChecklistTaskStatus({
        checklistId: checklist._id,
        sectionKey,
        taskKey,
        status,
      });
    } catch (updateError) {
      setChecklist(previousChecklist);
      setError(updateError.message);
    } finally {
      setPendingTaskId(null);
    }
  }

  return {
    checklist,
    completion,
    error,
    pendingTaskId,
    setTaskStatus,
  };
}
