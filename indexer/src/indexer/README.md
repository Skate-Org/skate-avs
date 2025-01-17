## Collection process

Do the following steps:

1. checking progress from saved json checkpoint, collect up until current date if any parts of the interval is missing
2. Afterwards, start watching for onchain events and update database. Please back up the json checkpoint every few minutes
3. If shutdown by control command, backup to json checkpoint immediately

---

JSON checkpoint will have the following format:
[{"start": <number>, "end": <number>}, ...] ordered (end_i <= start_j for all i ,j)
If it has more than 2 intervals, must retrieve missing task from interval in between.

**NOTE** Everytime the process start up, the goal is to "merge" all intervals into 1 by collecting missing data,
then start extending this interval by watch for any change.
