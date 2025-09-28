---
title: BigQuery syntax I wish I'd known sooner
description: These can save a lot of typing and complexity.
pubDate: 2024-11-17
updatedDate: 2025-08-07
---

If you've ever used BigQuery, you'll know it's an absolute beast of a warehouse, and its flavour of SQL (GoogleSQL) is fantastically deep and useful once you get into it.

However, when I got started, I ended up writing code that was more verbose than it needed to be because I didn't know all the syntax (especially features that were added to the language more recently) and was copying obsolete patterns from old-ish parts of the codebase.

Recently I've been trying to right this wrong by spending more time reading the BigQuery docs, and I've pulled together a rough collection of the most useful insights from this process below.

## Just use AI?

Large language models are fantastic tools for discovering this kind of thing. I like to paste in a query I've already written and ask if there are any newer language features I could make use of to improve the query. That's how I discovered many of these.

However, I generally do _not_ ask AI to generate queries directly. I think the "facepalm moment" of realising there is a better way is a much more powerful learning stimulus if you've been through the struggle of the old way first. Also, in my domain, very subtle errors can cause huge data quality problems down the line, so it would be risky to use LLM-generated queries directly.

## The Features

### HAVING

Allows you to query on an aggregate without using a CTE.

Old:

```sql
WITH department_salaries AS (
  SELECT
    department,
    AVG(salary) as avg_salary
  FROM employees
  GROUP BY department
)
SELECT
  department,
  avg_salary
FROM department_salaries
WHERE avg_salary > 100000;
```

New:

```sql
SELECT
  department,
  AVG(salary) as avg_salary,
  COUNT(*) as employee_count
FROM employees
GROUP BY department
HAVING AVG(salary) > 100000;
```

[Docs on HAVING](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#having_clause)

### QUALIFY

Allows you to filter on a window function without a CTE.

Old:

```sql
WITH ranked_employees AS (
  SELECT
    department,
    employee_name,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
  FROM employees
)
SELECT * EXCEPT (rank)
FROM ranked_employees
WHERE rank <= 2;
```

New:

```sql
 SELECT
  department,
  employee_name,
  salary
FROM employees
QUALIFY
	RANK() OVER (PARTITION BY department ORDER BY salary DESC) <= 2;
```

[Docs on QUALIFY](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#qualify_clause)

### ROLLUP

If you add the `ROLLUP` keyword to certain types of `GROUP BY` clauses, it will add a row with total aggregates. For example:

```sql
SELECT
  department,
  AVG(salary) AS avg_salary
FROM employees
GROUP BY ROLLUP (department)
```

will prepend to the results a row with aggregates against those columns for the entire table:

```text
|     department     |  avg_salary  |
| ------------------ | ------------ |
| null               | 45000        |
| department_1       | 40000        |
| department_2       | 45000        |
| department_3       | 50000        |
```

[Docs on ROLLUP](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#group_by_rollup)

### Timestamp +/- operator overloading

I find this nicer because the polarity (plus or minus) is no longer hidden in the function name.

You can also use the WEEK interval with operators, which oddly doesn't work with TIMESTAMP_ADD/TIMESTAMP_SUB.

Old:

```sql
SELECT
  TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 12 HOUR) as twelve_hours_ago,
  TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 7 DAY) as one_week_from_now;
```

New (note we can also use the `WEEK` interval):

```sql
SELECT
  CURRENT_TIMESTAMP() - INTERVAL 12 HOUR as twelve_hours_ago,
  CURRENT_TIMESTAMP() + INTERVAL 1 WEEK as one_week_from_now;
```

**However,** there is a gotcha with DATE:

```sql
SELECT
	-- This returns a DATETIME, not a DATE!!
  CURRENT_DATE() - INTERVAL 1 DAY as dt_yesterday,

  -- This returns DATE but the syntax feels implicit/weird
  CURRENT_DATE() - 1 AS date_yesterday_weird_syntax,

  -- This returns a DATE, but is almost as verbose as DATE_SUB()
  DATE(CURRENT_DATE() - INTERVAL 1 DAY) as date_yesterday
```

[Docs on interval arithmetic](https://cloud.google.com/bigquery/docs/reference/standard-sql/operators#interval_arithmetic_operators)

### IF() and IFNULL() functions

CASE WHEN is great for heavily branched logic, but for a single condition IF() is usually easier to read. There is also the shorthand IFNULL() for null checks.

Old:

```sql
SELECT
  CASE WHEN weight > 5 THEN 'large' ELSE 'small' END as size,
  CASE WHEN type IS NULL then 'unknown' ELSE type AS type;
```

New:

```sql
SELECT
  IF(weight > 5, 'large', 'small'),
  IFNULL(type, 'unknown') as type;

```

[Docs on IF()](https://cloud.google.com/bigquery/docs/reference/standard-sql/conditional_expressions#if)

[Docs on IFNULL()](https://cloud.google.com/bigquery/docs/reference/standard-sql/conditional_expressions#ifnull)

### IS DISTINCT FROM

This is a much more readable way to check for inequality, handling nulls as a regular value, not the insane way that they are handled by default.

Old:

```sql
SELECT
  employee_id,
  COALESCE((backup_phone IS NULL AND primary_phone IS NULL) OR backup_phone = primary_phone, FALSE) as same_phone_numbers
FROM employee_details;
```

New:

```sql
SELECT
  employee_id,
  backup_phone IS NOT DISTINCT FROM primary_phone as same_phone_numbers
FROM employee_details;
```

[Docs on IS DISTINCT FROM](https://cloud.google.com/bigquery/docs/reference/standard-sql/operators#is_distinct)

## EXCEPT DISTINCT

Old:

```sql
SELECT * FROM table1
LEFT JOIN table2 USING (id)
WHERE table2.id IS NULL;
```

New:

```sql
SELECT * FROM table1
EXCEPT DISTINCT
SELECT * FROM table2;
```

[Docs on EXCEPT](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#except)
