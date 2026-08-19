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
import BrandLogo from '../../components/BrandLogo/BrandLogo'
import ChatMockup from '../../components/ChatMockup/ChatMockup'
import { useTheme } from '../../context/ThemeProvider'
import { FEATURES } from '../../constants/home'
import styles from './Home.module.css'

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
