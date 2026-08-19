import Box from '@mui/material/Box'
import InsertDriveFile from '@mui/icons-material/InsertDriveFile'
import { formatFileSize, resolveMediaUrl } from '../../utils/media'
import type { FileAttachmentProps } from '../../interfaces/IComponent'
import styles from './FileAttachment.module.css'

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  url,
  fileName,
  fileSize,
}) => {
  return (
    <Box
      component="a"
      href={resolveMediaUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.link}
    >
      <Box className={styles.fileIcon}>
        <InsertDriveFile fontSize="small" />
      </Box>
      <Box className={styles.meta}>
        <Box component="span" className={styles.name}>
          {fileName}
        </Box>
        <Box component="span" className={styles.size}>
          {formatFileSize(fileSize)}
        </Box>
      </Box>
    </Box>
  )
}
