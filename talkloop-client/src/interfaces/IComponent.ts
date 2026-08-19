export interface BrandLogoProps {
  withText?: boolean
  whiteText?: boolean
  className?: string
}

export interface MessageTicksProps {
  read: boolean
  className?: string
}

export interface MessageImageProps {
  url: string
}

export interface FileAttachmentProps {
  url: string
  fileName: string
  fileSize: number
}
