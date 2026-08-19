import { useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { Link } from 'react-router-dom'
import useLoginForm from '../../hooks/useLoginForm'
import AuthLayout from '../../components/AuthLayout'
import styles from '../auth.module.css'

const Login: React.FC = () => {
  const {
    formData,
    validationErrors,
    isSubmitting,
    serverError,
    handleChange,
    handleLoginSubmit,
  } = useLoginForm()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <AuthLayout>
      <Box className={`${styles.cardWrap} animate-fade-up`}>
        <Paper elevation={3} className={styles.card}>
          <Typography variant="h5" component="h2" className={styles.cardTitle}>
            Welcome back
          </Typography>
          <Typography variant="body2" className={styles.cardSubtitle}>
            Sign in to pick up where you left off.
          </Typography>

          {serverError && (
            <Alert severity="error" className={styles.alert}>
              {serverError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleLoginSubmit}
            noValidate
            className={styles.form}
          >
            <TextField
              id="username"
              name="username"
              label={
                <>
                  Username{' '}
                  <Box component="span" className={styles.requiredAsterisk}>
                    *
                  </Box>
                </>
              }
              value={formData.username}
              onChange={handleChange}
              type="text"
              placeholder="Username"
              autoComplete="username"
              fullWidth
              error={Boolean(validationErrors.username)}
              helperText={validationErrors.username}
            />

            <TextField
              id="password"
              name="password"
              label={
                <>
                  Password{' '}
                  <Box component="span" className={styles.requiredAsterisk}>
                    *
                  </Box>
                </>
              }
              value={formData.password}
              onChange={handleChange}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete="current-password"
              fullWidth
              error={Boolean(validationErrors.password)}
              helperText={validationErrors.password}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((show) => !show)}
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControlLabel
              control={<Checkbox size="small" />}
              label={<Typography variant="body2">Remember me</Typography>}
              className={styles.rememberRow}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Box>

          <Typography variant="body2" className={styles.footerText}>
            New here?{' '}
            <Box
              component={Link}
              to="/register-user"
              className={styles.footerLink}
            >
              Create an account
            </Box>
          </Typography>
        </Paper>
      </Box>
    </AuthLayout>
  )
}

export default Login
