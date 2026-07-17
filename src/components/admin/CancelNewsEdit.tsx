'use client'

/** Returns an editor to the News list without creating or saving a document. */
export default function CancelNewsEdit() {
  const cancel = () => {
    if (window.confirm('Discard this News article without saving?')) {
      window.location.assign('/admin/collections/news')
    }
  }

  return <button type="button" className="btn btn--size-medium btn--style-secondary" onClick={cancel}>Cancel</button>
}
