import { useEffect, useState } from 'react';
import { CreditCard, Send } from 'lucide-react';
import API from '../api/axios.js';
import { formatPrice } from '../utils/formatters.js';

function PaymentPanel({ booking, onComplete }) {
  const [instructions, setInstructions] = useState(null);
  const [form, setForm] = useState({ method: 'mtn_momo', payerPhone: '', transactionReference: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    API.get('/bookings/payment-instructions')
      .then(({ data }) => setInstructions(data))
      .catch(() => setMessage('Could not load payment instructions.'));
  }, []);

  const submitPayment = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const { data } = await API.post(`/bookings/${booking._id}/payment`, form);
      onComplete(data.booking);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not submit payment details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const recipient = instructions?.methods?.[form.method];

  return (
    <form className="payment-panel" onSubmit={submitPayment}>
      <div className="payment-summary">
        <CreditCard aria-hidden="true" />
        <div>
          <p className="eyebrow">Payment details</p>
          <h2>{formatPrice(booking.totalPrice)}</h2>
          <p>Submit the payment reference after sending the amount. Hotel staff will verify it.</p>
        </div>
      </div>
      <label>
        Payment method
        <select
          name="method"
          value={form.method}
          onChange={(event) => setForm({ ...form, method: event.target.value })}
        >
          <option value="mtn_momo">MTN Mobile Money</option>
          <option value="orange_money">Orange Money</option>
        </select>
      </label>
      <p className="payment-recipient">{recipient || 'Loading payment recipient...'}</p>
      <label>
        Cameroon phone number
        <input
          name="payerPhone"
          inputMode="tel"
          placeholder="6XX XXX XXX"
          value={form.payerPhone}
          onChange={(event) => setForm({ ...form, payerPhone: event.target.value })}
          required
        />
      </label>
      <label>
        Transaction reference
        <input
          name="transactionReference"
          value={form.transactionReference}
          onChange={(event) => setForm({ ...form, transactionReference: event.target.value })}
          required
        />
      </label>
      {message && <p className="form-message">{message}</p>}
      <button className="primary-button" type="submit" disabled={isSubmitting}>
        <Send aria-hidden="true" />
        {isSubmitting ? 'Submitting...' : 'Submit for verification'}
      </button>
    </form>
  );
}

export default PaymentPanel;
