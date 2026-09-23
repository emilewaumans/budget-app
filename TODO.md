# TODO

## KBC bank statement import (CSV)

Add a CSV importer for transactions exported from KBC Touch / KBC online banking, so transactions
can be brought in without manual entry (no live bank sync — that would need a backend, which this
app deliberately doesn't have).

Blocked on: a real sample export from KBC (header row + 1-2 sample rows, amounts/payees can be
faked) so the parser is built against the actual column layout, delimiter, date format, and
decimal format instead of guessing.
