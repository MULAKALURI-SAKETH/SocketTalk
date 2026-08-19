import React, { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { EmojiPickerProps } from '../../interfaces/IChat'
import { EMOJIS } from '../../constants/chat'
import styles from './EmojiPicker.module.css'

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('')

  const filteredEmojis = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return EMOJIS
    return EMOJIS.filter((item) => item.label.includes(normalized))
  }, [query])

  return (
    <Paper
      onMouseDown={(event) => event.stopPropagation()}
      elevation={12}
      role="dialog"
      aria-label="Emoji picker"
      className={styles.picker}
    >
      <Box className={styles.searchRow}>
        <TextField
          size="small"
          fullWidth
          autoFocus
          placeholder="Search emojis..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </Box>
      <Box className={styles.grid}>
        {filteredEmojis.length === 0 ? (
          <Typography variant="body2" className={styles.empty}>
            No emojis found.
          </Typography>
        ) : (
          filteredEmojis.map((item) => (
            <Tooltip key={item.emoji} title={item.label}>
              <Box
                component="button"
                type="button"
                onClick={() => onSelect(item.emoji)}
                aria-label={item.label}
                className={styles.emojiBtn}
              >
                {item.emoji}
              </Box>
            </Tooltip>
          ))
        )}
      </Box>
      <Button
        fullWidth
        size="small"
        onClick={onClose}
        className={styles.closeBtn}
      >
        Close
      </Button>
    </Paper>
  )
}

export default EmojiPicker
