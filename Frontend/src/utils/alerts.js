import Swal from "sweetalert2";
import {
  primary,
  secondary,
  highlight,
  background,
  backgroundGradient,
  highlightGradient,
} from "../theme/theme";

import { toast } from "react-toastify";
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
  background: highlightGradient,
  color: background,
};

export function transaction(message, exec, options, getBlockData) {
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
        success(getBlockData);
      } catch (e) {
        console.log(e);
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

export function transactionChain(message, exec, getBlockData) {
  return Swal.fire({
    ...theme,
    position: "center",
    width: "fit-content",
    preConfirm: false,
    showConfirmButton: true,
    showLoaderOnConfirm: true,
    confirmButtonText: "Yes",
    showDenyButton: true,
    preConfirm: async () => {

      try {
        for(let f in exec){
          let tx = await exec[f].transaction(...exec[f].options);
          await tx.wait();
        }
        success(getBlockData);

      } catch (e) {
        console.log(e);
        if (e.data) {
          error(e.data.message);
        } else {
          error(e.message);
        }
      }
      return true;
    },
    html: message,
  });
}

export function success(getBlockData) {
  toast.success("Success", {
    position: "top-left",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });
  setTimeout(() => {
    getBlockData(false);
  }, 7000);
}

export function error(message) {
  toast.error(
    <div>
      <h4>Error</h4>
      <p style={{ fontSize: "small" }}>{message}</p>
    </div>,
    {
      position: "top-left",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    }
  );
  //return Swal.fire({
  //  ...theme,
  //  timer: 1500,
  //  allowOutsideClick: true,
  //  text: message,
  //});
}
