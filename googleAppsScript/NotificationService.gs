/* ============================================================
   NOTIFICATION SERVICE
   Four emails, two per funnel:

       discountSignup     -> customer welcome (carries PADDLE10)
                          -> Mary's signup alert
       commissionInquiry  -> customer acknowledgement (NO code)
                          -> Mary's actionable inquiry detail

   Every send here is best-effort by design. By the time these
   run the sheet row is already committed, so the sheet — not
   the mailbox — is the record. A mail failure is logged and
   swallowed: it must never surface to the visitor as a failed
   submission, and must never trigger a retry that would
   duplicate the row.

   Everything stated in these emails is something this project
   has already established: the artist's name, the studio's
   location, the studio email address, and the one verified
   social account. No expiry date, no minimum spend, no phone
   number, no second social account, and no response-time
   promise is claimed, because none has been supplied.
============================================================ */

/* ============================================================
   SEND HELPERS  (shared by both funnels)
============================================================ */

/**
 * One guarded send. Tries the HTML message, falls back to plain
 * text once, and reports whether anything got out.
 */
function sendGuardedEmail(options, logLabel)
{

    try
    {

        MailApp.sendEmail(options);

        logActivity(logLabel, options.to);

        return true;

    }
    catch (mailError)
    {

        /* Retry once as plain text — some failures are specific to
           the HTML payload or the replyTo header. This retry is
           itself wrapped, so a second failure still only logs. */

        logError(logLabel, mailError);

        try
        {

            MailApp.sendEmail(options.to, options.subject, options.body);

            logActivity(logLabel + '_PLAIN', options.to);

            return true;

        }
        catch (fallbackError)
        {

            logError(logLabel + '_PLAIN', fallbackError);

            return false;

        }

    }

}

/**
 * Escapes text before it is placed into an HTML email body.
 */
function escapeHtml(value)
{

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

}

/**
 * Renders a timestamp for a human reading their mail.
 */
function formatTimestamp(value)
{

    try
    {

        return Utilities.formatDate(
            value instanceof Date ? value : new Date(value),
            Session.getScriptTimeZone(),
            'EEE d MMM yyyy, h:mm a'
        );

    }
    catch (formatError)
    {

        return String(value);

    }

}

/**
 * The shared chrome every message sits in: sage header band,
 * cream card, colours taken from the site's own palette. Inline
 * styles only — every mail client strips a stylesheet.
 */
function wrapEmailHtml(headline, innerHtml, footerHtml)
{

    return [

        '<div style="margin:0;padding:24px 12px;background-color:#f1e2d3;',
        'font-family:Georgia,Times New Roman,serif;color:#4a3c35;">',

        '<div style="max-width:560px;margin:0 auto;background-color:#fdf5ed;',
        'border:1px solid #e0cfc2;">',

        '<div style="padding:26px 28px;background-color:#4a5142;color:#f7ede4;">',
        '<div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#d5c9b8;">',
        escapeHtml(BUSINESS.businessName),
        '</div>',
        '<div style="margin-top:8px;font-size:24px;line-height:1.25;color:#ffffff;">',
        escapeHtml(headline),
        '</div>',
        '</div>',

        '<div style="padding:28px;font-size:16px;line-height:1.6;">',
        innerHtml,
        '</div>',

        '<div style="padding:16px 28px;font-size:12px;color:#6d5b52;',
        'border-top:1px solid #e0cfc2;">',
        footerHtml,
        '</div>',

        '</div>',
        '</div>'

    ].join('');

}

/**
 * The signature both customer emails close with.
 */
function buildSignatureHtml()
{

    return [

        '<p style="margin:0 0 4px;color:#6d5b52;font-style:italic;">',
        'Painted one piece at a time,',
        '</p>',

        '<p style="margin:0;">',
        escapeHtml(BUSINESS.artistName),
        '<br>',
        escapeHtml(BUSINESS.businessName),
        '<br>',
        '<a href="mailto:', escapeHtml(BUSINESS.studioEmail), '" style="color:#8d463f;">',
        escapeHtml(BUSINESS.studioEmail),
        '</a>',
        '</p>'

    ].join('');

}

/**
 * A label/value table, used by both of Mary's notifications.
 */
function buildDetailTableHtml(rows)
{

    var rowHtml = rows.map(function (pair)
    {

        return '<tr>'
            + '<td style="padding:8px 14px;border-bottom:1px solid #e6dcd2;'
            + 'font-weight:bold;color:#2b2320;white-space:nowrap;vertical-align:top;">'
            + escapeHtml(pair[0])
            + '</td>'
            + '<td style="padding:8px 14px;border-bottom:1px solid #e6dcd2;color:#2b2320;">'
            + pair[1]
            + '</td>'
            + '</tr>';

    }).join('');

    return '<table style="width:100%;border-collapse:collapse;font-size:15px;">'
        + rowHtml
        + '</table>';

}


/* ============================================================
   DISCOUNT — CUSTOMER WELCOME
   The only message anywhere that carries PADDLE10.
============================================================ */

function sendDiscountCustomerEmail(record, isReturningSignup)
{

    return sendGuardedEmail({

        to: record.email,

        name: BUSINESS.businessName,

        replyTo: BUSINESS.studioEmail,

        subject: EMAIL_SUBJECTS.discountCustomer,

        body: buildDiscountCustomerText(record, isReturningSignup),

        htmlBody: buildDiscountCustomerHtml(record, isReturningSignup)

    }, 'DISCOUNT_CUSTOMER_EMAIL');

}

function buildDiscountCustomerText(record, isReturningSignup)
{

    var lines = [

        BUSINESS.businessName.toUpperCase(),

        OFFER_HEADLINE,

        '',

        'Hi there,',

        ''

    ];

    if (isReturningSignup)
    {

        lines.push(
            'You are already on the list, so here is your code again — '
            + 'no need to sign up twice.'
        );

    }
    else
    {

        lines.push(
            'Thank you for signing up. I am ' + BUSINESS.artistName
            + ', and I paint every ' + BUSINESS.businessName
            + ' piece by hand in my home studio in ' + BUSINESS.location + '.'
        );

    }

    lines.push('');

    lines.push('Your discount code:');

    lines.push('');

    lines.push('    ' + record.discountCode);

    lines.push('');

    lines.push(
        'It takes 10% off your first custom piece. Mention the code when you get '
        + 'in touch about a commission, or simply reply to this email and tell me '
        + 'what you have in mind — what you would like painted, and what it should '
        + 'go on.'
    );

    lines.push('');

    lines.push('See the catalogue: ' + BUSINESS.siteUrl);

    lines.push('Follow along on Facebook: ' + BUSINESS.facebookUrl);

    lines.push('');

    lines.push('Painted one piece at a time,');

    lines.push(BUSINESS.artistName);

    lines.push(BUSINESS.businessName);

    lines.push(BUSINESS.studioEmail);

    return lines.join('\n');

}

function buildDiscountCustomerHtml(record, isReturningSignup)
{

    var openingLine = isReturningSignup

        ? 'You are already on the list, so here is your code again &mdash; no need to sign up twice.'

        : 'Thank you for signing up. I am ' + escapeHtml(BUSINESS.artistName)
            + ', and I paint every ' + escapeHtml(BUSINESS.businessName)
            + ' piece by hand in my home studio in ' + escapeHtml(BUSINESS.location) + '.';

    var inner = [

        '<p style="margin:0 0 16px;">Hi there,</p>',

        '<p style="margin:0 0 22px;">', openingLine, '</p>',

        '<div style="margin:0 0 22px;padding:18px 20px;text-align:center;',
        'background-color:#f6ddd6;border:1px dashed #b97d76;">',
        '<div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8d463f;">',
        'Your discount code',
        '</div>',
        '<div style="margin-top:8px;font-size:28px;letter-spacing:0.14em;color:#8d463f;">',
        escapeHtml(record.discountCode),
        '</div>',
        '</div>',

        '<p style="margin:0 0 22px;">',
        'It takes 10% off your first custom piece. Mention the code when you get in ',
        'touch about a commission, or simply reply to this email and tell me what you ',
        'have in mind &mdash; what you would like painted, and what it should go on.',
        '</p>',

        '<p style="margin:0 0 8px;">',
        '<a href="', escapeHtml(BUSINESS.siteUrl), '" style="color:#8d463f;">',
        'See the catalogue',
        '</a>',
        '</p>',

        '<p style="margin:0 0 24px;">',
        '<a href="', escapeHtml(BUSINESS.facebookUrl), '" style="color:#8d463f;">',
        'Follow along on Facebook',
        '</a>',
        '</p>',

        buildSignatureHtml()

    ].join('');

    var footer = 'You are receiving this because you asked for the '
        + escapeHtml(BUSINESS.businessName)
        + ' discount code at '
        + escapeHtml(BUSINESS.siteUrl);

    return wrapEmailHtml(OFFER_HEADLINE, inner, footer);

}


/* ============================================================
   DISCOUNT — MARY'S ALERT
   Sent for NEW signups only. Its job is verification at the
   table: Mary can confirm entitlement from this, or from the
   customer's own copy of the welcome email, but DiscountLeads
   is what actually holds the list.
============================================================ */

function sendDiscountOwnerEmail(signup)
{

    return sendGuardedEmail({

        to: getOwnerEmail(),

        name: BUSINESS.businessName,

        replyTo: signup.email,

        subject: EMAIL_SUBJECTS.discountOwner + ' (' + signup.email + ')',

        body: buildDiscountOwnerText(signup),

        htmlBody: buildDiscountOwnerHtml(signup)

    }, 'DISCOUNT_OWNER_EMAIL');

}

function buildDiscountOwnerText(signup)
{

    return [

        'NEW 10% DISCOUNT SIGNUP',
        '=======================',
        '',
        'Customer email : ' + signup.email,
        'Signed up      : ' + formatTimestamp(signup.signupDate),
        'Claimed        : 10% off their first custom piece',
        'Discount code  : ' + DISCOUNT_CODE,
        '',
        'This customer has been recorded in the ' + SHEET_NAMES.DISCOUNT_LEADS + ' sheet',
        '(row ' + signup.rowNumber + '), which is the authoritative list.',
        '',
        'At the table you can confirm entitlement either by seeing the ',
        BUSINESS.businessName + ' discount email on their phone, or by finding',
        'them in ' + SHEET_NAMES.DISCOUNT_LEADS + '.',
        '',
        'They have been sent their code automatically — nothing further is needed.'

    ].join('\n');

}

function buildDiscountOwnerHtml(signup)
{

    var inner = [

        buildDetailTableHtml([

            ['Customer email', '<a href="mailto:' + escapeHtml(signup.email) + '" style="color:#8d463f;">' + escapeHtml(signup.email) + '</a>'],
            ['Signed up', escapeHtml(formatTimestamp(signup.signupDate))],
            ['Claimed', '10% off their first custom piece'],
            ['Discount code', '<strong style="letter-spacing:0.1em;color:#8d463f;">' + escapeHtml(DISCOUNT_CODE) + '</strong>'],
            ['Recorded in', escapeHtml(SHEET_NAMES.DISCOUNT_LEADS) + ' (row ' + signup.rowNumber + ')']

        ]),

        '<p style="margin:22px 0 0;font-size:15px;">',
        'At the table you can confirm entitlement either by seeing the ',
        escapeHtml(BUSINESS.businessName),
        ' discount email on their phone, or by finding them in ',
        '<strong>', escapeHtml(SHEET_NAMES.DISCOUNT_LEADS), '</strong>, which is the ',
        'authoritative list.',
        '</p>',

        '<p style="margin:14px 0 0;font-size:15px;color:#6d5b52;">',
        'They have already been sent their code automatically &mdash; nothing further ',
        'is needed.',
        '</p>'

    ].join('');

    return wrapEmailHtml(
        'New 10% signup',
        inner,
        'Sent automatically from ' + escapeHtml(BUSINESS.siteUrl)
    );

}


/* ============================================================
   COMMISSION — CUSTOMER ACKNOWLEDGEMENT
   Deliberately NOT the discount email, and deliberately without
   PADDLE10: submitting an inquiry does not earn the offer.
   No response time is promised, because none is established.
============================================================ */

function sendCommissionCustomerEmail(record, receipt)
{

    return sendGuardedEmail({

        to: record.email,

        name: BUSINESS.businessName,

        replyTo: BUSINESS.studioEmail,

        subject: EMAIL_SUBJECTS.commissionCustomer,

        body: buildCommissionCustomerText(record, receipt),

        htmlBody: buildCommissionCustomerHtml(record, receipt)

    }, 'COMMISSION_CUSTOMER_EMAIL');

}

function buildCommissionCustomerText(record, receipt)
{

    var lines = [

        BUSINESS.businessName.toUpperCase(),

        'Your custom piece inquiry',

        '',

        'Hi ' + record.name + ',',

        '',

        'Thank you for reaching out — I have your inquiry about a custom piece, '
        + 'and I am glad you did.',

        '',

        'I am ' + BUSINESS.artistName + ', and I paint every ' + BUSINESS.businessName
        + ' piece by hand in my home studio in ' + BUSINESS.location + '. I will read '
        + 'through what you sent me properly, and then I will come back to you to talk '
        + 'the piece through — what you have in mind, what it should go on, and how to '
        + 'make it yours.',

        '',

        'Here is what you sent me:',

        ''

    ];

    lines.push('  What to paint : ' + record.idea);

    if (record.surface)
    {

        lines.push('  Surface       : ' + record.surface);

    }

    if (record.occasion)
    {

        lines.push('  Occasion      : ' + record.occasion);

    }

    if (record.referencedPiece)
    {

        lines.push('  Piece you saw : ' + record.referencedPiece);

    }

    lines.push('  Reference     : ' + receipt.inquiryId);

    lines.push('');

    lines.push(
        'If you think of anything else in the meantime, just reply to this email '
        + 'and it comes straight to me.'
    );

    lines.push('');

    lines.push('See the catalogue: ' + BUSINESS.siteUrl);

    lines.push('Follow along on Facebook: ' + BUSINESS.facebookUrl);

    lines.push('');

    lines.push('Painted one piece at a time,');

    lines.push(BUSINESS.artistName);

    lines.push(BUSINESS.businessName);

    lines.push(BUSINESS.studioEmail);

    return lines.join('\n');

}

function buildCommissionCustomerHtml(record, receipt)
{

    var summaryRows = [

        ['What to paint', escapeHtml(record.idea).replace(/\n/g, '<br>')]

    ];

    if (record.surface)
    {

        summaryRows.push(['Surface', escapeHtml(record.surface)]);

    }

    if (record.occasion)
    {

        summaryRows.push(['Occasion', escapeHtml(record.occasion)]);

    }

    if (record.referencedPiece)
    {

        summaryRows.push(['Piece you saw', escapeHtml(record.referencedPiece)]);

    }

    summaryRows.push(['Reference', escapeHtml(receipt.inquiryId)]);

    var inner = [

        '<p style="margin:0 0 16px;">Hi ', escapeHtml(record.name), ',</p>',

        '<p style="margin:0 0 18px;">',
        'Thank you for reaching out &mdash; I have your inquiry about a custom piece, ',
        'and I am glad you did.',
        '</p>',

        '<p style="margin:0 0 22px;">',
        'I am ', escapeHtml(BUSINESS.artistName), ', and I paint every ',
        escapeHtml(BUSINESS.businessName), ' piece by hand in my home studio in ',
        escapeHtml(BUSINESS.location), '. I will read through what you sent me ',
        'properly, and then I will come back to you to talk the piece through ',
        '&mdash; what you have in mind, what it should go on, and how to make it yours.',
        '</p>',

        '<div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;',
        'color:#8d463f;margin:0 0 10px;">Here is what you sent me</div>',

        buildDetailTableHtml(summaryRows),

        '<p style="margin:22px 0 24px;">',
        'If you think of anything else in the meantime, just reply to this email and ',
        'it comes straight to me.',
        '</p>',

        buildSignatureHtml()

    ].join('');

    var footer = 'You are receiving this because you asked about a custom piece at '
        + escapeHtml(BUSINESS.siteUrl);

    return wrapEmailHtml('Your custom piece inquiry', inner, footer);

}


/* ============================================================
   COMMISSION — MARY'S NOTIFICATION
   Everything she needs to act on the inquiry from the email
   itself, with replyTo set to the customer so hitting reply
   just works. CommissionLeads remains the durable record.
============================================================ */

function sendCommissionOwnerEmail(record, receipt)
{

    return sendGuardedEmail({

        to: getOwnerEmail(),

        name: BUSINESS.businessName,

        replyTo: record.email,

        subject: EMAIL_SUBJECTS.commissionOwner + ' (' + record.name + ')',

        body: buildCommissionOwnerText(record, receipt),

        htmlBody: buildCommissionOwnerHtml(record, receipt)

    }, 'COMMISSION_OWNER_EMAIL');

}

function buildCommissionOwnerText(record, receipt)
{

    return [

        'NEW COMMISSION INQUIRY',
        '======================',
        '',
        'Reference   : ' + receipt.inquiryId,
        'Received    : ' + formatTimestamp(receipt.submittedAt),
        '',
        'Name        : ' + record.name,
        'Email       : ' + record.email,
        'Surface     : ' + (record.surface || 'Not specified'),
        'Occasion    : ' + (record.occasion || 'Not specified'),
        'Piece seen  : ' + (record.referencedPiece || 'None'),
        'Source      : ' + record.source,
        '',
        'What they would like painted:',
        '',
        record.idea,
        '',
        '---',
        'Recorded in ' + SHEET_NAMES.COMMISSION_LEADS + ' (row ' + receipt.rowNumber + '),',
        'which is the durable record — this email is just the alert.',
        '',
        'Reply to this email to answer ' + record.name + ' directly.'

    ].join('\n');

}

function buildCommissionOwnerHtml(record, receipt)
{

    var inner = [

        buildDetailTableHtml([

            ['Name', escapeHtml(record.name)],
            ['Email', '<a href="mailto:' + escapeHtml(record.email) + '" style="color:#8d463f;">' + escapeHtml(record.email) + '</a>'],
            ['Surface', escapeHtml(record.surface || 'Not specified')],
            ['Occasion', escapeHtml(record.occasion || 'Not specified')],
            ['Piece they saw', escapeHtml(record.referencedPiece || 'None')],
            ['Received', escapeHtml(formatTimestamp(receipt.submittedAt))],
            ['Reference', escapeHtml(receipt.inquiryId)],
            ['Source', escapeHtml(record.source)]

        ]),

        '<div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;',
        'color:#8d463f;margin:24px 0 10px;">What they would like painted</div>',

        '<div style="padding:14px 16px;background-color:#ffffff;border:1px solid #e0cfc2;',
        'white-space:pre-wrap;font-size:15px;color:#2b2320;">',
        escapeHtml(record.idea),
        '</div>',

        '<p style="margin:22px 0 0;font-size:15px;">',
        'Recorded in <strong>', escapeHtml(SHEET_NAMES.COMMISSION_LEADS), '</strong> ',
        '(row ', String(receipt.rowNumber), '), which is the durable record &mdash; ',
        'this email is just the alert.',
        '</p>',

        '<p style="margin:14px 0 0;font-size:15px;color:#6d5b52;">',
        'Reply to this email to answer ', escapeHtml(record.name), ' directly.',
        '</p>'

    ].join('');

    return wrapEmailHtml(
        'New commission inquiry',
        inner,
        'Sent automatically from ' + escapeHtml(BUSINESS.siteUrl)
    );

}
