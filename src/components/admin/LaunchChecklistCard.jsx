'use client'

import { CheckCircle2, Circle, LoaderCircle } from 'lucide-react'

import { useLaunchChecklistManager } from '@/hooks/useLaunchChecklistManager'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusLabels = {
  todo: 'Todo',
  in_progress: 'In progress',
  blocked: 'Blocked',
  done: 'Done',
}

const statusClasses = {
  todo: 'bg-muted text-foreground',
  in_progress: 'bg-blue-100 text-blue-900',
  blocked: 'bg-red-100 text-red-900',
  done: 'bg-emerald-100 text-emerald-900',
}

export default function LaunchChecklistCard({ checklist }) {
  const {
    checklist: currentChecklist,
    completion,
    error,
    pendingTaskId,
    setTaskStatus,
  } = useLaunchChecklistManager(checklist)

  return (
    <Card className="shadow-theme-sm">
      <CardHeader>
        <CardTitle className="text-base">{currentChecklist.title}</CardTitle>
        {currentChecklist.summary ? (
          <p className="leading-6 text-muted-foreground text-sm">{currentChecklist.summary}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
          <span>
            {completion.completed} of {completion.total} complete
          </span>
        </div>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {currentChecklist.sections?.map((section) => (
          <div
            key={section._key || section.title}
            className="p-5 bg-muted/20 border border-border rounded-xl"
          >
            <div className="mb-4">
              <h3 className="text-foreground text-sm tracking-tight">{section.title}</h3>
              {section.description ? (
                <p className="mt-1 leading-6 text-muted-foreground text-sm">{section.description}</p>
              ) : null}
            </div>

            <div className="space-y-3">
              {section.tasks?.map((task) => {
                const taskId = `${section._key}:${task._key}`
                const isPending = pendingTaskId === taskId
                const isDone = task.status === 'done'

                return (
                  <div
                    key={task._key || task.title}
                    className="p-4 bg-background border border-border rounded-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="mt-0.5 rounded-full shrink-0"
                          disabled={isPending}
                          onClick={() =>
                            setTaskStatus({
                              sectionKey: section._key,
                              taskKey: task._key,
                              status: isDone ? 'todo' : 'done',
                            })
                          }
                        >
                          {isPending ? (
                            <LoaderCircle className="animate-spin" />
                          ) : isDone ? (
                            <CheckCircle2 className="text-emerald-600" />
                          ) : (
                            <Circle className="text-muted-foreground" />
                          )}
                        </Button>
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-medium ${isDone ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                          >
                            {task.title}
                          </div>
                          {task.notes ? (
                            <p className="mt-1 leading-6 text-muted-foreground text-sm">{task.notes}</p>
                          ) : null}
                          <div className="flex flex-wrap items-center gap-2 mt-3 text-muted-foreground text-sm">
                            {task.owner ? <span>Owner: {task.owner}</span> : null}
                            {task.priority ? <span>Priority: {task.priority}</span> : null}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-sm font-medium ${statusClasses[task.status] || statusClasses.todo}`}
                      >
                        {statusLabels[task.status] || statusLabels.todo}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
