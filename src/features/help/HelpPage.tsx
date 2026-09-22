import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Download,
  Landmark,
  Lock,
  PiggyBank,
  Tags,
} from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'

export default function HelpPage() {
  return (
    <div className="page">
      <PageHeader title="How this app works" back />
      <div className="page-body help-content">
        <p>
          This app is a notebook for your money. It helps you keep track of what you spend and
          what you receive, so you always know where your money is.
        </p>

        <section>
          <h3>
            <ArrowUpRight size={20} /> Adding something you spent
          </h3>
          <p>
            On the <strong>Home</strong> screen, tap the big red <strong>Add Expense</strong>{' '}
            button. Type in how much you spent and who you paid (for example "Supermarket"), then
            tap <strong>Save</strong>. That's it — today's date is already filled in for you.
          </p>
        </section>

        <section>
          <h3>
            <ArrowDownLeft size={20} /> Adding money you received
          </h3>
          <p>
            Tap the big green <strong>Add Income</strong> button, for example when your salary
            arrives. Fill in the amount and where it came from, then tap <strong>Save</strong>.
          </p>
        </section>

        <section>
          <h3>
            <Landmark size={20} /> Accounts
          </h3>
          <p>
            An "account" is simply a place where your money is — your bank account, a savings
            account, or cash in your wallet. You can add more than one, and each shows its own
            balance (how much money is in it right now).
          </p>
        </section>

        <section>
          <h3>
            <Tags size={20} /> Categories
          </h3>
          <p>
            A "category" is a label for what you spent money on, like "Groceries" or
            "Electricity". It helps you see where your money goes. You don't have to pick one
            every time — if you're in a hurry, leaving it as "Uncategorized" is perfectly fine.
          </p>
        </section>

        <section>
          <h3>The Budget screen (like envelopes of cash)</h3>
          <p>
            Imagine putting cash into separate envelopes each month — one for groceries, one for
            electricity, and so on. The Budget screen works the same way, just on your phone.
          </p>
          <p>
            <strong>"Ready to Assign"</strong> is money you've received but haven't put into an
            envelope yet. Once you put money into a category, it stays there — even when the
            month changes — until you actually spend it. It never just disappears.
          </p>
        </section>

        <section>
          <h3>
            <PiggyBank size={20} /> Savings Goals
          </h3>
          <p>
            This is a different, happier kind of envelope — for something you're looking forward
            to, like a new watch or a vacation, not a bill. It works the same way as a budget
            category (you set money aside for it a little at a time, and it never resets), but it
            lives on its own screen under <strong>More → Savings Goals</strong> so it never gets
            mixed in with your everyday spending.
          </p>
        </section>

        <section>
          <h3>
            <BarChart3 size={20} /> Reports
          </h3>
          <p>
            The Reports tab shows simple bar charts: how much you spent in each category, and how
            your spending compares month to month.
          </p>
        </section>

        <section>
          <h3>
            <Lock size={20} /> Locking the app
          </h3>
          <p>
            You can set a PIN code, like on a bank card, so no one else can open the app. Go to{' '}
            <strong>More → Settings → App lock</strong> to set, change, or remove it.
          </p>
        </section>

        <section>
          <h3>
            <Download size={20} /> Getting a copy of your information
          </h3>
          <p>
            If you'd like a copy of everything in the app (for example, to open in Excel), go to{' '}
            <strong>More → Settings → Export all data</strong>. It saves a file with everything in
            it — you're never stuck with only this app.
          </p>
        </section>

        <section>
          <h3>Something not working?</h3>
          <p>
            Close the app completely and open it again from its icon on your home screen. That
            fixes almost everything.
          </p>
        </section>
      </div>
    </div>
  )
}
