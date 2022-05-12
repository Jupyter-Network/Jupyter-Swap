import Swal from "sweetalert2";
import { primary, secondary, highlight, background } from "../theme/theme";

const theme = {
  showConfirmButton: false,
  allowOutsideClick: false,
  position: "bottom",
  showClass: {
    popup: `
        animate__animated
        animate__fadeInUp
      `,
  },
  hideClass: {
    popup: `
        animate__animated
        animate__fadeOutDown
      `,
  },
  backdrop: false,
  grow: "row",
  heightAuto: false,
  background: background,
  color: primary,
};

export function transaction(
    message,
  exec,
  options
) {
  return Swal.fire({
    ...theme,
    position: "center",
    titleText: "Transaction",
    width: "fit-content",
    preConfirm: false,
    showConfirmButton: true,
    showLoaderOnConfirm: true,
    confirmButtonText: "Yes",
    showDenyButton: true,
    preConfirm: async () => {
      try {
        let tx = await exec(...options);
        await tx.wait();
        success()
      } catch (e) {
        if (e.data) {
          error(e.data.message);
        } else {
          error(e.message);
        }
      }
      return true;
    },
    text: message,
  });
}

export function success() {
  return Swal.fire({
    ...theme,
    //icon:"success",
    timer: 1500,
    text: "Success",
  });
}

export function error(message) {
  return Swal.fire({
    ...theme,
    timer: 1500,
    allowOutsideClick: true,
    text: message,
  });
}
