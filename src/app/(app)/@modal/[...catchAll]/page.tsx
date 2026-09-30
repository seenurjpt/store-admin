// A slot keeps showing its last page during client-side navigation, so any other route
// (e.g. the product page opened after creating one) needs to match here to close the dialog.
export default function CatchAll() {
  return null;
}
