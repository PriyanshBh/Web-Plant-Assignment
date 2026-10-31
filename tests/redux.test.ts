import { describe, it, expect } from "vitest";
import authReducer, { setUnauthenticated } from "../src/store/slices/authSlice";
import projectsReducer, { updateProjectCounts } from "../src/store/slices/projectsSlice";
import tasksReducer, {
  optimisticStatusChange,
  rollbackOptimisticUpdate,
  selectTaskCounts,
  selectOverdueTasksCount,
  selectCompletionRate,
  TasksState,
} from "../src/store/slices/tasksSlice";
import { ITaskResponse } from "../src/models/Task";

describe("Redux Slices and Selectors", () => {
  it("authSlice should handle setUnauthenticated", () => {
    const prevState = {
      user: {
        id: "1",
        name: "Test",
        email: "test@example.com",
        createdAt: "",
        updatedAt: "",
      },
      status: "authenticated" as const,
      error: null,
      fieldErrors: null,
    };
    const nextState = authReducer(prevState, setUnauthenticated());
    expect(nextState.user).toBeNull();
    expect(nextState.status).toBe("unauthenticated");
  });

  it("projectsSlice should update project counts", () => {
    const initialState = {
      items: [
        {
          id: "p1",
          owner: "u1",
          title: "Project 1",
          description: "",
          taskCounts: { total: 0, todo: 0, inProgress: 0, done: 0 },
          createdAt: "",
          updatedAt: "",
        },
      ],
      currentProject: null,
      status: "idle" as const,
      error: null,
    };

    const nextState = projectsReducer(
      initialState,
      updateProjectCounts({
        projectId: "p1",
        taskCounts: { total: 3, todo: 1, inProgress: 1, done: 1 },
      })
    );

    expect(nextState.items[0].taskCounts?.total).toBe(3);
  });

  it("tasksSlice should handle optimistic updates and rollbacks", () => {
    const initialTasks: ITaskResponse[] = [
      {
        id: "t1",
        project: "p1",
        owner: "u1",
        title: "Task 1",
        description: "",
        status: "todo",
        dueDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const initialState: TasksState = {
      items: initialTasks,
      filters: { status: "all", sort: "createdAt", order: "desc", q: "" },
      status: "idle",
      error: null,
      previousItems: null,
    };

    // Optimistically mark as done
    const updatedState = tasksReducer(
      initialState,
      optimisticStatusChange({ taskId: "t1", status: "done" })
    );
    expect(updatedState.items[0].status).toBe("done");
    expect(updatedState.previousItems?.[0].status).toBe("todo");

    // Rollback
    const rolledBackState = tasksReducer(updatedState, rollbackOptimisticUpdate());
    expect(rolledBackState.items[0].status).toBe("todo");
    expect(rolledBackState.previousItems).toBeNull();
  });

  it("tasks selectors should calculate correct stats and overdue counts", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString();

    const mockState = {
      tasks: {
        items: [
          {
            id: "1",
            project: "p1",
            owner: "u1",
            title: "Task 1",
            description: "",
            status: "todo" as const,
            dueDate: yesterday, // Overdue!
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "2",
            project: "p1",
            owner: "u1",
            title: "Task 2",
            description: "",
            status: "in-progress" as const,
            dueDate: tomorrow,
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "3",
            project: "p1",
            owner: "u1",
            title: "Task 3",
            description: "",
            status: "done" as const,
            dueDate: yesterday, // Done tasks are not counted as overdue
            createdAt: "",
            updatedAt: "",
          },
        ],
        filters: { status: "all" as const, sort: "createdAt" as const, order: "desc" as const, q: "" },
        status: "idle" as const,
        error: null,
        previousItems: null,
      },
    };

    const counts = selectTaskCounts(mockState);
    expect(counts).toEqual({ total: 3, todo: 1, inProgress: 1, done: 1 });

    const overdueCount = selectOverdueTasksCount(mockState);
    expect(overdueCount).toBe(1);

    const completionRate = selectCompletionRate(mockState);
    expect(completionRate).toBe(33); // 1 of 3 = 33%
  });
});
