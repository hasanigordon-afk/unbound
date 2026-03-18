import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { clientEmail, recipientEmail, metrics, checkIns, counselorName } = await req.json();

    if (!clientEmail || !recipientEmail) {
      return Response.json({ error: 'clientEmail and recipientEmail are required' }, { status: 400 });
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    // ── Build PDF ────────────────────────────────────────────────────────────
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const W = 612;
    const BLUE  = [74, 144, 226];
    const DARK  = [30, 30, 30];
    const MUTED = [142, 142, 147];
    const GREEN = [34, 197, 94];
    const AMBER = [245, 158, 11];
    const RED   = [239, 68, 68];

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Header bar
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, W, 70, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Unbound Recovery', 40, 32);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Weekly Progress Summary', 40, 52);

    // Date range & client
    doc.setTextColor(...DARK);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Period: ${fmtDate(weekStart)} – ${fmtDate(now)}`, 40, 92);
    doc.text(`Client: ${clientEmail}`, 40, 108);
    doc.text(`Prepared by: ${counselorName || user.full_name || user.email}`, 40, 124);
    doc.text(`Generated: ${fmtDate(now)}`, 40, 140);

    // Divider
    doc.setDrawColor(209, 209, 214);
    doc.line(40, 154, W - 40, 154);

    // ── Engagement Summary ────────────────────────────────────────────────────
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Engagement Summary', 40, 178);

    const engScore  = metrics?.engagementScore ?? '—';
    const engLevel  = metrics?.engagementLevel ?? '—';
    const engColor  = engLevel === 'Stable' ? GREEN : engLevel === 'Moderate Risk' ? AMBER : RED;

    // Metric boxes
    const boxes = [
      { label: 'Engagement Score', value: String(engScore), color: BLUE },
      { label: 'Risk Level',       value: engLevel,          color: engColor },
      { label: 'Avg Mood (1-5)',   value: String(metrics?.avgMood ?? '—'), color: AMBER },
      { label: 'Avg Craving (1-5)',value: String(metrics?.avgCraving ?? '—'), color: parseFloat(metrics?.avgCraving) >= 4 ? RED : [99, 102, 241] },
      { label: 'Meetings Attended',value: String(metrics?.weeklyMeetings ?? 0), color: GREEN },
      { label: 'Sponsor Contacts', value: String(metrics?.sponsorContacts ?? 0), color: [139, 92, 246] },
    ];

    const bw = 90, bh = 56, bpad = 10;
    boxes.forEach((b, i) => {
      const x = 40 + i * (bw + bpad);
      const y = 192;
      doc.setFillColor(245, 245, 248);
      doc.roundedRect(x, y, bw, bh, 4, 4, 'F');
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...b.color);
      doc.text(b.value, x + bw / 2, y + 30, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text(b.label, x + bw / 2, y + 46, { align: 'center' });
    });

    // ── Sobriety ────────────────────────────────────────────────────────────
    if (metrics?.sobrietyDays !== null && metrics?.sobrietyDays !== undefined) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GREEN);
      doc.text(`🌟  Sobriety Streak: ${metrics.sobrietyDays} days`, 40, 270);
    }

    // ── Daily Check-In Log ────────────────────────────────────────────────────
    const last7Checkins = (checkIns || [])
      .filter(c => new Date(c.check_in_date || c.date) >= weekStart)
      .sort((a, b) => new Date(a.check_in_date || a.date) - new Date(b.check_in_date || b.date));

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Daily Check-In Log', 40, 296);

    if (last7Checkins.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...MUTED);
      doc.text('No check-ins recorded this week.', 40, 316);
    } else {
      // Table header
      const cols = ['Date', 'Mood', 'Craving', 'Meeting', 'Sponsor', 'Notes'];
      const colX  = [40, 130, 195, 258, 322, 385];
      let rowY = 312;

      doc.setFillColor(...BLUE);
      doc.rect(40, rowY - 12, W - 80, 18, 'F');
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      cols.forEach((c, i) => doc.text(c, colX[i], rowY));
      rowY += 8;

      doc.setFont('helvetica', 'normal');
      last7Checkins.forEach((c, idx) => {
        rowY += 18;
        if (idx % 2 === 0) {
          doc.setFillColor(247, 247, 248);
          doc.rect(40, rowY - 12, W - 80, 18, 'F');
        }
        doc.setTextColor(...DARK);
        doc.setFontSize(8.5);
        const moodLabel  = {1:'Very Low',2:'Low',3:'Neutral',4:'Good',5:'Great'}[c.mood_rating] || String(c.mood_rating ?? '—');
        const cravLabel  = {1:'None',2:'Mild',3:'Moderate',4:'Strong',5:'Severe'}[c.craving_level || c.craving_intensity] || '—';
        doc.text(String(c.check_in_date || c.date || '—'), colX[0], rowY);
        doc.text(moodLabel, colX[1], rowY);
        doc.text(cravLabel, colX[2], rowY);
        doc.text(c.attended_meeting || c.meetings_attended > 0 ? '✓' : '—', colX[3], rowY);
        doc.text(c.connected_with_sponsor || c.sponsor_contact ? '✓' : '—', colX[4], rowY);
        const notesTxt = (c.notes || '').substring(0, 35) + ((c.notes || '').length > 35 ? '…' : '');
        doc.text(notesTxt, colX[5], rowY);
      });
      rowY += 10;
    }

    // ── Alerts ────────────────────────────────────────────────────────────────
    const hasAlerts = metrics?.missedCheckIns || metrics?.highCravings || metrics?.noMeetings;
    if (hasAlerts) {
      const alertY = Math.min(500, doc.internal.getCurrentPageInfo().pageContext.mediaBox.topRightY - 150);
      doc.addPage();
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...RED);
      doc.text('Active Alerts', 40, 60);
      let ay = 80;
      if (metrics.missedCheckIns) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DARK);
        doc.text('• Missed 3+ check-ins in the past 7 days', 40, ay); ay += 20;
      }
      if (metrics.highCravings) {
        doc.text('• Elevated craving levels reported (avg ≥ 4)', 40, ay); ay += 20;
      }
      if (metrics.noMeetings) {
        doc.text('• No meeting attendance recorded this week', 40, ay); ay += 20;
      }
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const pages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text('Unbound is a behavioral engagement platform. This report does not constitute clinical advice.', W / 2, 770, { align: 'center' });
      doc.text(`Page ${p} of ${pages}`, W - 40, 770, { align: 'right' });
    }

    const pdfBase64 = doc.output('datauristring').split(',')[1];

    // ── Send email via Base44 ────────────────────────────────────────────────
    const weekLabel = `${fmtDate(weekStart)} – ${fmtDate(now)}`;
    const emailBody = `
<div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; color: #1E1E1E;">
  <div style="background: #4A90E2; padding: 28px 32px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #FFF; margin: 0; font-size: 20px;">Unbound Recovery</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Weekly Progress Summary</p>
  </div>
  <div style="background: #FFF; padding: 28px 32px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 15px; margin-top: 0;">Hello,</p>
    <p style="font-size: 14px; color: #374151;">
      Please find attached the weekly progress summary for <strong>${clientEmail}</strong> covering the period
      <strong>${weekLabel}</strong>.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
      <tr style="background: #F7F7F8;">
        <td style="padding: 10px 14px; font-weight: 600;">Engagement Score</td>
        <td style="padding: 10px 14px; color: #4A90E2; font-weight: 700;">${engScore} / 100</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-weight: 600;">Risk Level</td>
        <td style="padding: 10px 14px;">${engLevel}</td>
      </tr>
      <tr style="background: #F7F7F8;">
        <td style="padding: 10px 14px; font-weight: 600;">Avg Mood</td>
        <td style="padding: 10px 14px;">${metrics?.avgMood ?? '—'} / 5</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-weight: 600;">Meetings Attended</td>
        <td style="padding: 10px 14px;">${metrics?.weeklyMeetings ?? 0}</td>
      </tr>
      <tr style="background: #F7F7F8;">
        <td style="padding: 10px 14px; font-weight: 600;">Check-Ins This Week</td>
        <td style="padding: 10px 14px;">${last7Checkins.length} / 7</td>
      </tr>
    </table>
    <p style="font-size: 13px; color: #6B7280;">
      The full PDF report is attached to this email. For questions, contact your care coordinator.
    </p>
    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
    <p style="font-size: 11px; color: #9CA3AF; margin-bottom: 0;">
      Unbound is a behavioral engagement platform. This report does not constitute clinical advice or a medical diagnosis.
    </p>
  </div>
</div>
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `Weekly Progress Summary – ${clientEmail} (${weekLabel})`,
      body: emailBody,
    });

    // Upload PDF for download link
    const pdfBytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });

    return Response.json({ success: true, file_url });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});