import {
  ArrowUpRight,
  BarChart3,
  Landmark,
  Lock,
  MoreHorizontal,
  PiggyBank,
  Repeat,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'

interface Topic {
  id: string
  title: string
  Icon: typeof ArrowUpRight
  content: ReactNode
}

const TOPICS: Topic[] = [
  {
    id: 'transactions',
    title: 'Adding money in and out',
    Icon: ArrowUpRight,
    content: (
      <>
        <p>
          On the <strong>Home</strong> screen, tap the big red <strong>Add Expense</strong> button
          when you spend money, or the big green <strong>Add Income</strong> button when you
          receive it. Type in the amount and who you paid or who paid you, then tap{' '}
          <strong>Save</strong>. That's it — today's date is already filled in for you.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts',
    Icon: Landmark,
    content: (
      <p>
        An "account" is simply a place where your money is — your bank account, a savings
        account, or cash in your wallet. You can add more than one under{' '}
        <strong>More → Accounts</strong>, and each shows its own balance (how much money is in it
        right now).
      </p>
    ),
  },
  {
    id: 'payees',
    title: 'Payees',
    Icon: Users,
    content: (
      <p>
        A payee is who you paid or who paid you. Save one under <strong>More → Payees</strong>{' '}
        and it shows up as a suggestion the next time you type a similar name — or tap the
        bookmark icon next to the Payee field while adding a transaction to save whatever you
        just typed.
      </p>
    ),
  },
  {
    id: 'goals',
    title: 'Savings Goals',
    Icon: PiggyBank,
    content: (
      <>
        <p>
          A savings goal is something you're looking forward to, like a new watch or a vacation —
          not a bill. Give it a name and a target amount, then log deposits whenever you set money
          aside for it.
        </p>
        <p>
          Every goal keeps a full log book: you can see exactly when you saved how much, edit or
          delete any entry, or log a withdrawal if you need to take some of that money back out.
        </p>
      </>
    ),
  },
  {
    id: 'reports',
    title: 'Reports',
    Icon: BarChart3,
    content: (
      <p>
        Under <strong>More → Reports</strong> you'll find a simple bar chart showing how much you
        spent each month, so you can see how your spending compares over time.
      </p>
    ),
  },
  {
    id: 'recurring',
    title: 'Recurring',
    Icon: Repeat,
    content: (
      <p>
        If you log the same thing often, like your salary or a subscription, save it once under{' '}
        <strong>More → Recurring</strong> — including how often it repeats (daily, weekly,
        monthly, every 6 months, yearly, or a custom interval like "every 3 weeks"). To actually
        log a transaction from it, tap the repeat icon next to it on that Recurring screen — that
        creates today's entry instantly, ready for you to double check. The chip that shows up on
        the Home screen is for a quick look instead: tap it to see or adjust the template,
        including its period. Nothing is added automatically on a schedule; the period is just
        there so you remember how often each one comes around.
      </p>
    ),
  },
  {
    id: 'more',
    title: 'The More menu',
    Icon: MoreHorizontal,
    content: (
      <p>
        Everything that isn't Home or Savings Goals lives here. Tap the gear icon in the top-right
        corner to change the color of any button — tap a color swatch to pick it, then tap the
        checkmark when you're done.
      </p>
    ),
  },
  {
    id: 'settings',
    title: 'Settings',
    Icon: Lock,
    content: (
      <>
        <p>
          Under <strong>Appearance</strong>, choose Light, Dark, or System (which follows your
          phone's own setting).
        </p>
        <p>
          You can set a PIN code, like on a bank card, so no one else can open the app — tap{' '}
          <strong>Change PIN</strong> to set, change, or remove it. Once a PIN is set, devices
          that support it can also offer <strong>Set up Face ID</strong> so unlocking is one tap
          instead of typing — your PIN still works as a backup.
        </p>
        <p>
          You can also download a copy of everything in the app as a .zip of CSV files (for
          example, to open in Excel) — you're never stuck with only this app.
        </p>
      </>
    ),
  },
]

const INTRO =
  "This app is a notebook for your money. It helps you keep track of what you spend and what you receive, so you always know where your money is."

const TROUBLESHOOTING = 'Close the app completely and open it again from its icon on your home screen. That fixes almost everything.'

export default function HelpPage() {
  const [searchParams] = useSearchParams()
  const topicId = searchParams.get('topic')
  const topics = topicId ? TOPICS.filter((t) => t.id === topicId) : TOPICS
  const title = topicId ? (topics[0]?.title ?? 'How this app works') : 'How this app works'

  return (
    <div className="page">
      <PageHeader title={title} back />
      <div className="page-body help-content">
        {!topicId && <p>{INTRO}</p>}

        {topics.map((topic) => (
          <section key={topic.id}>
            <h3>
              <topic.Icon size={20} /> {topic.title}
            </h3>
            {topic.content}
          </section>
        ))}

        {!topicId && (
          <section>
            <h3>Something not working?</h3>
            <p>{TROUBLESHOOTING}</p>
          </section>
        )}
      </div>
    </div>
  )
}
