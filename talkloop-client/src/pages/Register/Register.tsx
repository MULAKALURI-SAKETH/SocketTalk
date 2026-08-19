import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { Link } from 'react-router-dom'
import useRegisterForm from '../../hooks/useRegisterForm'
import { fields } from '../../constants/auth'
import { IFormField } from '../../interfaces/IForm'
import AuthLayout from '../../components/AuthLayout/AuthLayout'
import styles from '../auth.module.css'

const Register: React.FC = () => {
  const {
    formData,
    validationErrors,
    isSubmitting,
    handleChange,
    handleRegisterSubmit,
  } = useRegisterForm()

  return (
    <AuthLayout>
      <Box className={`${styles.cardWrap} animate-fade-up`}>
        <Paper elevation={3} className={styles.card}>
          <Typography variant="h5" component="h2" className={styles.cardTitle}>
            Create your account
          </Typography>
          <Typography variant="body2" className={styles.cardSubtitle}>
            Join Talkloop and start talking in real time.
          </Typography>

          <Box
            component="form"
            onSubmit={handleRegisterSubmit}
            noValidate
            className={styles.form}
          >
            {fields.map((field: IFormField) => {
              const error = validationErrors[field.name]
              return (
                <TextField
                  key={field.name}
                  id={field.name}
                  name={field.name}
                  label={
                    <>
                      {field.label}{' '}
                      <Box component="span" className={styles.requiredAsterisk}>
                        *
                      </Box>
                    </>
                  }
                  value={formData[field.name]}
                  onChange={handleChange}
                  type={field.type}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  fullWidth
                  error={Boolean(error)}
                  helperText={error}
                />
              )
            })}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </Box>

          <Typography variant="body2" className={styles.footerText}>
            Already have an account?{' '}
            <Box component={Link} to="/login" className={styles.footerLink}>
              Sign in
            </Box>
          </Typography>
        </Paper>
      </Box>
    </AuthLayout>
  )
}

export default Register
