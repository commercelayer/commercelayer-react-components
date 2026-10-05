// `fields` is an HTMLFormControlsCollection, which also yields buttons, fieldsets
// and outputs. The implementation used to assert `(v: FormField)` on the callback
// parameter instead of checking, so a named <button> was collected as if it were
// a field, while <textarea> was missing from the FormField union even though
// MetadataInput, CustomerInput and GiftCardOrCouponInput all render one.
import validateFormFields from "#utils/validateFormFields"

function formWith(html: string): HTMLFormControlsCollection {
  const form = document.createElement("form")
  form.innerHTML = html
  document.body.appendChild(form)
  return form.elements
}

describe("validateFormFields", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("collects textarea values", () => {
    const fields = formWith(`<textarea name="notes">leave at the door</textarea>`)

    const { values } = validateFormFields(fields, [], "addresses")

    expect(values).toMatchObject({ notes: "leave at the door" })
  })

  it("collects select values", () => {
    const fields = formWith(`
      <select name="country_code">
        <option value="IT" selected>Italy</option>
      </select>
    `)

    const { values } = validateFormFields(fields, [], "addresses")

    expect(values).toMatchObject({ country_code: "IT" })
  })

  it("ignores buttons, which are form controls but not fields", () => {
    const fields = formWith(`
      <textarea name="notes">hi</textarea>
      <button name="action" value="save">Save</button>
    `)

    const { values } = validateFormFields(fields, [], "addresses")

    expect(values).toMatchObject({ notes: "hi" })
    expect(values).not.toHaveProperty("action")
  })

  it("still reports a required field left empty", () => {
    const fields = formWith(`<textarea name="notes"></textarea>`)

    const { errors } = validateFormFields(fields, ["notes"], "addresses")

    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatchObject({ field: "notes", resource: "addresses" })
  })

  // Not a consequence of the narrowing above: `isTick` is `"checked" in v`, and
  // `checked` sits on HTMLInputElement.prototype, so it is true for every input,
  // not just checkboxes — every <input> is therefore collected as `true` rather
  // than as its value. Pinned here as the current behaviour, not endorsed.
  it("collects any input as `true`, whatever its value (pre-existing)", () => {
    const fields = formWith(`<input name="first_name" value="Bruce" />`)

    const { values } = validateFormFields(fields, [], "addresses")

    expect(values).toMatchObject({ first_name: true })
  })
})
