import { createSlice } from '@reduxjs/toolkit';

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    myTasks: [],
    selectedTask: null,
    isLoading: false,
    error: null,
    filters: {
      category: null,
      radius: 5,
      search: '',
    },
  },
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    setMyTasks: (state, action) => {
      state.myTasks = action.payload;
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addTask: (state, action) => {
      state.myTasks.push(action.payload);
    },
    updateTaskStatus: (state, action) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.status;
      }
    },
  },
});

export const {
  setTasks,
  setMyTasks,
  setSelectedTask,
  setLoading,
  setError,
  setFilters,
  addTask,
  updateTaskStatus,
} = taskSlice.actions;

export default taskSlice.reducer;
