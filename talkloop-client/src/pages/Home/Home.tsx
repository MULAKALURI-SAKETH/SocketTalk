import React from 'react'
import { Link } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import LightMode from '@mui/icons-material/LightMode'
import DarkMode from '@mui/icons-material/DarkMode'
import BrandLogo from '../../components/BrandLogo'
import ChatMockup from '../../components/ChatMockup'
import { useTheme } from '../../context/ThemeProvider'
import styles from './Home.module.css'

const FEATURES = [
  {
    title: 'Real-time messaging',
    description:
      'Messages land the instant you hit send, powered by WebSocket STOMP under the hood.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
        width={24}
        height={24}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>
    ),
  },
  {
    title: 'Read receipts',
    description:
      'Double ticks tell you when your message was delivered and when it was read.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
        width={24}
        height={24}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
  },
  {
    title: 'Share files & images',
    description:
      'Send photos and documents with a preview — images render right in the conversation.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
        width={24}
        height={24}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-5.409-9.909h.008v.008h-.008V6.75zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM3.75 21h16.5A1.5 1.5 0 0 0 21.75 19.5V4.5A1.5 1.5 0 0 0 20.25 3H3.75A1.5 1.5 0 0 0 2.25 4.5v15A1.5 1.5 0 0 0 3.75 21z"
        />
      </svg>
    ),
  },
  {
    title: 'Edit & delete anytime',
    description:
      'Fix typos or remove a message — edits sync live, and deletes are per-user or for everyone.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
        width={24}
        height={24}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
        />
      </svg>
    ),
  },
]

const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme()
  return (
    <IconButton
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={className}
    >
      {theme === 'dark' ? <LightMode /> : <DarkMode />}
    </IconButton>
  )
}

const Home: React.FC = () => {
  return (
    <Box className={styles.root}>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        className={styles.appBar}
      >
        <Toolbar className={styles.toolbar}>
          <Link to="/" aria-label="Talkloop home">
            <BrandLogo />
          </Link>
          <Box className={styles.navActions}>
            <Button
              component="a"
              href="#features"
              className={styles.navTextButton}
            >
              Features
            </Button>
            <ThemeToggle className={styles.themeToggle} />
            <Button
              component={Link}
              to="/login"
              className={styles.navSignInButton}
            >
              Sign in
            </Button>
            <Button
              component={Link}
              to="/register-user"
              variant="contained"
              className={styles.getStartedBtn}
            >
              Get started
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="section" className={styles.heroSection}>
        <Box className={styles.glow} />

        <Container maxWidth="lg" className={styles.heroContainer}>
          <Grid container spacing={6} className={styles.heroGrid}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box className="animate-fade-up">
                <Chip
                  icon={<Box className={styles.chipDot} />}
                  label="Now with read receipts, edits & deletes"
                  className={styles.heroChip}
                />
                <Typography
                  variant="h2"
                  component="h1"
                  className={styles.heroTitle}
                >
                  Chat that feels{' '}
                  <Box component="span" className={styles.gradientText}>
                    instant.
                  </Box>
                </Typography>
                <Typography
                  variant="h6"
                  component="p"
                  className={styles.heroSubtitle}
                >
                  Talkloop is a real-time chat app where messages arrive the
                  moment you send them — no page refreshes, no waiting.
                </Typography>
                <Box className={styles.heroActions}>
                  <Button
                    component={Link}
                    to="/register-user"
                    variant="contained"
                    size="large"
                    className={styles.primaryCta}
                  >
                    Start chatting free
                  </Button>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    size="large"
                    className={styles.outlinedCta}
                  >
                    Sign in
                  </Button>
                </Box>
                <Box component="dl" className={styles.stats}>
                  {[
                    ['< 50ms', 'Typical delivery'],
                    ['100%', 'Real-time, not polling'],
                    ['24/7', 'Always connected'],
                  ].map(([value, label]) => (
                    <Box key={label} component="div">
                      <Box component="dd" className={styles.statValue}>
                        {value}
                      </Box>
                      <Box component="dt" className={styles.statLabel}>
                        {label}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box className={`animate-fade-up ${styles.heroMockup}`}>
                <ChatMockup />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="section" id="features" className={styles.featuresSection}>
        <Container maxWidth="lg">
          <Box className={styles.featuresHeader}>
            <Typography
              variant="h3"
              component="h2"
              className={styles.featuresTitle}
            >
              Everything a great chat needs
            </Typography>
            <Typography
              variant="h6"
              component="p"
              className={styles.featuresSubtitle}
            >
              Built for speed and reliability, with the details that make
              conversations feel natural.
            </Typography>
          </Box>

          <Grid container spacing={3} className={styles.featuresGrid}>
            {FEATURES.map((feature) => (
              <Grid key={feature.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card elevation={1} className={styles.featureCard}>
                  <CardContent>
                    <Box className={styles.featureIcon}>{feature.icon}</Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      className={styles.featureTitle}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" className={styles.featureDesc}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box component="section" className={styles.ctaSection}>
        <Container maxWidth="lg">
          <Box className={styles.ctaCard}>
            <Box className={styles.ctaBlobTop} />
            <Box className={styles.ctaBlobBottom} />
            <Typography variant="h3" component="h2" className={styles.ctaTitle}>
              Ready to talk?
            </Typography>
            <Typography
              variant="h6"
              component="p"
              className={styles.ctaSubtitle}
            >
              Create a free account and your first message is only a click away.
            </Typography>
            <Button
              component={Link}
              to="/register-user"
              variant="contained"
              disableElevation
              size="large"
              className={styles.ctaButton}
            >
              Get started — it's free
            </Button>
          </Box>
        </Container>
      </Box>

      <Box component="footer" className={styles.footer}>
        <Container maxWidth="lg">
          <Box className={styles.footerInner}>
            <BrandLogo />
            <Typography variant="body2" className={styles.footerText}>
              © {new Date().getFullYear()} Talkloop. Real-time chat, minus the
              boring parts.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Home
