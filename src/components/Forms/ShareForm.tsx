import React, { useCallback, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from '@fortawesome/free-solid-svg-icons'

interface ShareFormProps {
  id: string;
  onDismiss: () => void;
}

export default function ShareForm({ id, onDismiss }: ShareFormProps) {
  const [copied, setCopied] = useState('')
  const sherableLinkRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = useCallback(() => {
    const node = sherableLinkRef.current
    node?.select();
    document.execCommand('copy');
    setCopied('copied!')
  }, [sherableLinkRef, setCopied]);

  return (
    <div>
      <h2>Share Workout</h2>
      <div className="form-control">
        <label htmlFor="link">Share this link</label>
        <input type="text" name="link" value={"https://www.zwiftworkout.com/editor/" + id} ref={sherableLinkRef} />
        <button onClick={copyToClipboard}><FontAwesomeIcon icon={faCopy} size="lg" fixedWidth /> {copied}</button>
        <button className="btn" onClick={onDismiss}>Dismiss</button>
      </div>
    </div>
  )
}

