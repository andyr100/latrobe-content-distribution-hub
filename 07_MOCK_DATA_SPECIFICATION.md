# Mock Data Specification

## Users

```text
Administrator — Administrator
Dr Sarah Williams — Lecturer
Prof Michael Chen — Lecturer
Dr Emily Taylor — Lecturer
```

## Fixed classifications

1. University News
2. Subject News
3. Assessment Information
4. Examination Information
5. Timetable Changes
6. Assignment Updates
7. Industry News
8. Career Opportunities
9. Student Services
10. General Announcement

## Subject channels

Provide 10–12 records. All codes must begin with `LT`.

Recommended seed channels:

| Code | Subject |
|---|---|
| LTCSE4CBA | Cloud Based Applications |
| LTCSE3DBF | Database Fundamentals |
| LTCSE3AIM | Artificial Intelligence Methods |
| LTCSE2WEB | Web Development |
| LTCSE3NET | Computer Networks |
| LTCSE2SEC | Cybersecurity Fundamentals |
| LTCSE3DMI | Data Mining |
| LTCSE4MLA | Machine Learning Applications |
| LTINF2HCI | Human–Computer Interaction |
| LTINF3PMT | Project Management |
| LTCSE2SWE | Software Engineering |
| LTINF1ITF | Information Technology Fundamentals |

Give each a semester, active state and synthetic post count.

## External RSS feeds

Use exactly:

1. Microsoft AI Blog
2. AWS News
3. Google Developers
4. Stack Overflow Blog
5. Higher Education News

Create ten synthetic articles for each feed.

Requirements:

- 50 unique IDs
- realistic but fictional titles and summaries
- varied dates/times
- classifications drawn from the fixed list
- no copyrighted article copying
- source clearly displayed
- newest first by default

## Internal posts

Seed enough posts to demonstrate:

- multiple authors
- different classifications
- one and multiple destination channels
- different timestamps
- filtering by author, classification and channel
- recent activity

New posts are inserted at the beginning.

## Recent activity

Keep to approximately five items and derive from realistic mock actions such as:

- lecturer published a post
- administrator added a channel
- lecturer republished an external article
- feed subscription changed

## Determinism

Keep seed data in central files. Do not generate random values on every render because counts and screenshots should remain stable.
