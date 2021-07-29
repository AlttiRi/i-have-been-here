
It's the demo extension that I use for some tests.

---

### Firefox notes:

Remove:

- `"downloads.shelf",`

- `"incognito": "split",`


Add:
```
"browser_specific_settings": {
    "gecko": {
        "id": "Demo@Demo"
    }
}
```
