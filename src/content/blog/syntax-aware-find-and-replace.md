---
title: Syntax-aware find and replace
description: Make rapid, safe changes to your codebase in ways `sed` can only dream about.
pubDate: 2024-06-02
---

Code bases often go sour not because people don't _want_ to improve them, but because the length of time it would take to make improvements far exceeds the value of the changes.

This is especially the case for little aesthetic bugbears. On their own they don't mean much, but if they mount up they can cause a death-by-a-thousand-cuts scenario where they start to really impact on the day-to-day quality of a programmer's life.

Fortunately, there are increasingly powerful ways to fix these issues mechanically, allowing us to make the kind of quality-of-life improvements that would previously have been considered too much manual work. 

### Example

Here's a slightly contrived example of a common issue. Let's say you inherited a codebase that someone had at one stage attempted to make more _functional_. However, by now there is only the odd remnant, for example, this test code which sets up entities in the database:

```typescript
const insertUser =
  (server: Server) => async (params: { id: string; name: string }) => {
    await http(server).post('/user').send(params).expect(201);
  };
```

Which is called in tests like this:

```typescript
it('GET /users returns all users', async () => {
  await insertUser(server)({ id: '123', name: 'Nick' });
  await request(server)
    .get('/users')
    .expect(200, [{ id: '123', name: 'Nick' }]);
});
```

That inappropriately curried function: it's not a big thing, but every time you come across it it's just _slightly annoying_. Maybe you have juniors in the team who keep misunderstanding it and losing a lot of time. If you could change it to a regular function in a couple of minutes, you definitely would - but it's got hundreds of callsites and they are all slightly different!

### Regex pain

You might put your old-school Unix hat on and run a regex find-and-replace:

```shell
sed -i 's/insertUser(\(.*\))(/insertUser(\1, /g' src/**/*.ts
```

This will work for a lot of cases. But it has two downsides. Firstly, even after years of use, I still find constructing those regex commands fiddly as hell, and pretty easy to get wrong. Worse than that, there are also plenty of edge cases that it won't catch. Here's one where a programmer decided they knew better than Prettier:

```typescript
// prettier-ignore
await insertUser(
  server
)({
  id: '123',
  name: 'Nick',
});
```

And here's a monster that would break even the hardiest regex:

```typescript
await insertUser(
  new App()
    .use(bs())
    .use(moreCurriedBs()(bs()))
    .get('/', serverHandler)
    .listen(3000),
)(getParams(server));
```

You get the idea. For a heavily used function in a large code base, these edge cases will exist, and you will spend hours manually fixing them even if the regex worked 80% of the time.

This is where _syntax-aware_ find-and-replace comes in.

### The solution

[ast-grep](https://ast-grep.github.io/) parses source code and rewrites it according to user input in a regex-like pattern matching syntax, with support for nearly every programming language you can imagine. It is written in Rust (and its parser runtime, [tree-sitter](https://tree-sitter.github.io/tree-sitter/), in C), so it's pretty much as fast as sed.

A basic usage of ast-grep (`sg` on the command line) could look like this:

```shell
sg -i -p "insertUser(server)({ id: '123', name: 'Nick' })" \
      -r "insertUser(server, { id: '123', name: 'Nick'})" \
      ./src/**/*.ts
```

Here `-p` is the pattern to match and `-r` is the pattern to replace it with, while the `-i` switch enters an interactive mode a bit like `git add -p`.

Running this shows it is already an improvement: any formatting variations that would have caused regex to fall over will be matched by this command.

But we can go further and use ast-grep's AST-aware template arguments to solve this entire problem in one command!

```shell
sg -i -p 'insertUser($$SERVER)($$$ARGS)' \
      -r 'insertUser($$SERVER, $$$ARGS)' \
      ./src/**/*.ts
```

Here we are using two types of template argument, which I've named `SERVER` and `ARGS`:

- The `$$<ident>` syntax matches a _single_ AST node, for the single curried parameter. This means `insertUser(a, b)(c)` wouldn't match. But it also means any arbitrarily complicated single expression _will_ match. Any of these therefore match the first template variable:
  - `insertUser(server)`
  - `insertUser(getServer())`
  - `insertUser(app.use(moreCurriedBs()(bs())).server())`
- `$$$<ident>` means _zero or more_ AST nodes. So any of these will match both template variables:
  - `insertUser(server)({ id: '123', name: 'Nick' })`
  - `insertUser(server)({ id: '123', name: 'Nick' }, { arg2: true })`
  - `insertUser(server)()`

This hits all of our requirements and as long as the code base is all syntactically valid, it will work perfectly.

### What can't it do?

One catch I've found so far is that inline comments count as an AST node in ways that can be surprising. These won't match our command above:

```typescript
insertUser(/* inline comment */ server)({ id: '123', name: 'Nick' });
insertUser(
  server, // inline comment
)({ id: '123', name: 'Nick' });
```

You could probably work around by changing `$$SERVER` to `$$$SERVER` - but you may then have issues with duplicate commas.

Fortunately, for more complex scenarios, ast-grep goes much deeper indeed. The above edge case and many more can be solved by delving into advanced features such as [YAML rules](https://ast-grep.github.io/guide/rule-config.html) and APIs in [JavaScript](https://ast-grep.github.io/guide/api-usage/js-api.html) and [Python](https://ast-grep.github.io/guide/api-usage/py-api.html). Also, if you like being told off by your computer, ast-grep can even be used as a [linter](https://ast-grep.github.io/guide/project/lint-rule.html#lint-rule).

## Conclusion

Structural code editing is a great tool to have in your arsenal. It lets us take minor bugbears that would otherwise mount up and make us miserable, and fix them in a fully automated - and safe - manner.
