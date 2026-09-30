import { PictureOutlined } from '@ant-design/icons'
import { Image } from 'antd'

interface ProjectHeroProps {
  imageUrl: string
  charName: string
}

/**
 * Hero — คงโครง gradient เดิม ผ่าน token ใหม่ (accent → purple)
 * รูป = antd Image (preview ซูมฟรี) / ไม่มีรูป = ไอคอน PictureOutlined
 */
export default function ProjectHero({ imageUrl, charName }: ProjectHeroProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '200px',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginBottom: 'var(--space-4)',
        background: 'linear-gradient(135deg, var(--accent), var(--purple))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`รูปประกอบโปรเจกต์ ${charName}`}
          style={{ width: '100%', height: '100%' }}
          styles={{ image: { width: '100%', height: '100%', objectFit: 'cover' } }}
        />
      ) : (
        <PictureOutlined style={{ fontSize: 64, color: 'var(--accent-on)' }} />
      )}
    </div>
  )
}
