import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import { useTheme } from '../context/ThemeProvider'
import LightMode from '@mui/icons-material/LightMode'
import DarkMode from '@mui/icons-material/DarkMode'
import styles from './AuthLayout.module.css'

const FEATURE_BLURBS = [
  'Real-time messages the moment you hit send.',
  'Read receipts, edits and deletes — just like WhatsApp.',
  'Share images and files in a single tap.',
  'Your conversations survive server restarts.',
]

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useTheme()
  const [blurbIndex, setBlurbIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setBlurbIndex((index) => (index + 1) % FEATURE_BLURBS.length)
    }, 4000)
    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <Box className={styles.root}>
      <Box className={styles.panel}>
        <Box className={styles.blobTop} />
        <Box className={styles.blobBottom} />

        <Box className={styles.panelHeader}>
          <BrandLogo withText whiteText />
          <IconButton
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={styles.themeBtn}
          >
            {theme === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Box>

        <Box className={styles.panelBody}>
          <Typography variant="h3" component="h1" className={styles.headline}>
            Chat that feels
            <br />
            instant.
          </Typography>

          <Box className={styles.blurb}>
            <Typography
              key={blurbIndex}
              className={`animate-fade-up ${styles.blurbText}`}
              variant="body1"
            >
              {FEATURE_BLURBS[blurbIndex]}
            </Typography>
          </Box>

          <Box className={styles.dots}>
            {FEATURE_BLURBS.map((_, index) => (
              <Box
                key={index}
                className={`${styles.dot} ${
                  index === blurbIndex ? styles.dotActive : ''
                }`}
              />
            ))}
          </Box>
        </Box>

        <Typography variant="body2" className={styles.panelFooter}>
          © {new Date().getFullYear()} Talkloop — real-time chat, minus the
          boring parts.
        </Typography>
      </Box>

      <Box className={styles.formCol}>
        <Box className={styles.mobileHeader}>
          <Link to="/" aria-label="Talkloop home">
            <BrandLogo />
          </Link>
          <IconButton
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={styles.mobileToggle}
          >
            {theme === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Box>

        <Box className={styles.formWrap}>{children}</Box>
      </Box>
    </Box>
  )
}

export default AuthLayout
