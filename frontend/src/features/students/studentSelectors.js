export const selectCurrentStudentProfile = (state) => state.students.currentStudent;
export const selectSelectedStudent = (state) => state.students.selectedStudent;
export const selectStudentsList = (state) => state.students.studentsList;
export const selectStudentsPagination = (state) => ({
  page: state.students.page,
  totalPages: state.students.totalPages,
  totalElements: state.students.totalElements,
});
export const selectStudentLoading = (state) => state.students.isLoading;
export const selectStudentError = (state) => state.students.error;

