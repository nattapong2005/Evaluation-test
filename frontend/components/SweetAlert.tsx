import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export const confirmDelete = (
  callback: () => void,
  options?: { title?: string; text?: string; confirmButtonText?: string }
) => {
  Swal.fire({
    title: options?.title || 'คุณแน่ใจหรือไม่?',
    text: options?.text || "คุณจะไม่สามารถย้อนกลับสิ่งนี้ได้!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: options?.confirmButtonText || 'ใช่, ลบเลย!',
    cancelButtonText: 'ยกเลิก',
  }).then((result) => {
    if (result.isConfirmed) {
      callback();
    }
  });
};
