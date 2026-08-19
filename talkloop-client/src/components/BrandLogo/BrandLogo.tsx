import Box from '@mui/material/Box'
import type { BrandLogoProps } from '../../interfaces/IComponent'
import styles from './BrandLogo.module.css'

const BrandLogo: React.FC<BrandLogoProps> = ({
  withText = true,
  whiteText = false,
  className,
}) => {
  return (
    <Box component="span" className={`${styles.root} ${className ?? ''}`}>
      <Box component="span" className={styles.icon}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width={20}
          height={20}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97Z"
            clipRule="evenodd"
          />
        </svg>
        <Box component="span" className={styles.badge}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            width={8}
            height={8}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
        </Box>
      </Box>
      {withText && (
        <Box
          component="span"
          className={`${styles.text} ${whiteText ? styles.textWhite : ''}`}
        >
          Talkloop
        </Box>
      )}
    </Box>
  )
}

export default BrandLogo
