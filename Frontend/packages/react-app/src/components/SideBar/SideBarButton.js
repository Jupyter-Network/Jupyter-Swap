import styles from "./SideBarButton.module.css"
export default function SideBarButton({text,onClick}){
    return(<button onClick={()=>onClick()} className={styles.sideBarButton}>{text}</button>)
}