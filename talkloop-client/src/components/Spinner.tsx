import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import styles from './Spinner.module.css'

const Spinner: React.FC = () => {
  return (
    <Box role="status" aria-label="Loading" className={styles.spinner}>
      <CircularProgress size={40} />
    </Box>
  )
}

export default Spinner
