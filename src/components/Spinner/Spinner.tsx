import styles from './Spinner.module.css'

const Spinner = ({ size = 7 }: { size?: number }) => {
  return (
    <div className={styles.spinner} style={{ fontSize: `${size}px` }}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export default Spinner
