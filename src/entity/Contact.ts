import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ type: 'enum', enum: ['primary', 'secondary'] })
  linkPrecedence?: 'primary' | 'secondary';

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn({ name: 'linkedId' })
  linkedId?: Contact;

  @CreateDateColumn()
  createdAt?: Date;

  @CreateDateColumn()
  updatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;
}
