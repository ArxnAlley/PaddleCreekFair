/* ============================================================
   VALIDATION
   Payload validation, sanitization and normalization.

   The sanitizers at the top are shared by both funnels. Only
   the two validate*Payload functions below them are
   funnel-specific, and neither can produce the other's record.
============================================================ */

/**
 * Removes control characters, strips angle brackets to block
 * markup injection, collapses whitespace, and enforces a
 * maximum length.
 */
function sanitizeText(value, maxLength)
{

    if (value === null || value === undefined)
    {

        return '';

    }

    var cleaned = String(value)
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .replace(/[<>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    var limit = maxLength || INPUT_LIMITS.maxShortTextLength;

    return cleaned.length > limit ? cleaned.substring(0, limit) : cleaned;

}

/**
 * As sanitizeText, but keeps line breaks. Used for the one
 * free-text field a visitor writes prose into, where paragraph
 * shape is part of what they said.
 */
function sanitizeMultiline(value, maxLength)
{

    if (value === null || value === undefined)
    {

        return '';

    }

    var cleaned = String(value)
        .replace(/\r\n/g, '\n')
        .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
        .replace(/[<>]/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    var limit = maxLength || INPUT_LIMITS.maxMessageLength;

    return cleaned.length > limit ? cleaned.substring(0, limit) : cleaned;

}

/**
 * A leading =, +, - or @ makes Sheets treat a cell as a formula.
 * Prefixing with an apostrophe forces the cell to text without
 * changing what Mary reads in the column.
 */
function neutralizeFormula(value)
{

    if (typeof value !== 'string' || value.length === 0)
    {

        return value;

    }

    if (/^[=+\-@]/.test(value))
    {

        return "'" + value;

    }

    return value;

}


/* ============================================================
   FIELD VALIDATORS
============================================================ */

/**
 * Deliberately permissive, and the same shape the website uses
 * client-side: something, an @, something, a dot, a two-plus
 * character tail. Rejecting a real customer over an unusual but
 * legal address is far worse than accepting a messy one.
 */
function isValidEmail(value)
{

    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

}

/**
 * The canonical form used for storage and for duplicate
 * matching. Lower-casing is what makes the duplicate check
 * case-insensitive: MARY@Example.com and mary@example.com
 * reduce to the same key, so the second one can never open a
 * second row.
 */
function normalizeEmail(value)
{

    return sanitizeText(value, INPUT_LIMITS.maxEmailLength)
        .replace(/\s+/g, '')
        .toLowerCase();

}

/**
 * Returns true when the hidden honeypot field was filled in,
 * which indicates an automated submission.
 */
function isSpamSubmission(payload)
{

    return Boolean(payload && payload.honeypot);

}


/* ============================================================
   ROUTING
============================================================ */

/**
 * Resolves the payload's submissionType to one of the two known
 * funnels. Returns '' when it is missing or unrecognised, which
 * the caller turns into a refusal — a request that does not say
 * what it is never gets guessed at.
 */
function resolveSubmissionType(payload)
{

    var requested = sanitizeText(payload && payload.submissionType, 40);

    if (requested === SUBMISSION_TYPES.DISCOUNT)
    {

        return SUBMISSION_TYPES.DISCOUNT;

    }

    if (requested === SUBMISSION_TYPES.COMMISSION)
    {

        return SUBMISSION_TYPES.COMMISSION;

    }

    return '';

}


/* ============================================================
   DISCOUNT PAYLOAD
============================================================ */

/**
 * Validates and normalizes a 10% offer signup.
 *
 * Returns:
 *     {
 *         isValid: boolean,
 *         errors: string[],
 *         record: object|null
 *     }
 */
function validateDiscountPayload(payload)
{

    if (!payload || typeof payload !== 'object')
    {

        return {

            isValid: false,

            errors: ['Missing signup data.'],

            record: null

        };

    }

    var email = normalizeEmail(payload.email);

    if (email === '')
    {

        return {

            isValid: false,

            errors: ['An email address is required.'],

            record: null

        };

    }

    if (!isValidEmail(email))
    {

        return {

            isValid: false,

            errors: ['Please enter a valid email address.'],

            record: null

        };

    }

    /* The discount code is never taken from the payload. It is
       assigned here, server-side, from Config. */

    return {

        isValid: true,

        errors: [],

        record: {

            email: email,

            discountCode: DISCOUNT_CODE,

            source: sanitizeText(payload.source, INPUT_LIMITS.maxSourceLength) || 'unknown'

        }

    };

}


/* ============================================================
   COMMISSION PAYLOAD

   Fields mirror the real Start a Piece form in index.html:
   visitorName, visitorEmail, pieceSurface, pieceIdea,
   pieceOccasion, plus the catalogue piece the visitor had open.

   Required, matching the form's own client-side rules: name,
   a well-formed email, and something about what to paint.
============================================================ */

/**
 * Validates and normalizes a commission inquiry.
 */
function validateCommissionPayload(payload)
{

    if (!payload || typeof payload !== 'object')
    {

        return {

            isValid: false,

            errors: ['Missing inquiry data.'],

            record: null

        };

    }

    var errors = [];

    var name = sanitizeText(payload.visitorName, INPUT_LIMITS.maxNameLength);

    if (name === '')
    {

        errors.push('Please tell me your name.');

    }

    var email = normalizeEmail(payload.visitorEmail);

    if (email === '')
    {

        errors.push('An email address is required.');

    }
    else if (!isValidEmail(email))
    {

        errors.push('Please enter a valid email address.');

    }

    var idea = sanitizeMultiline(payload.pieceIdea, INPUT_LIMITS.maxMessageLength);

    if (idea === '')
    {

        errors.push('Please say a little about what you would like painted.');

    }

    if (errors.length > 0)
    {

        return {

            isValid: false,

            errors: errors,

            record: null

        };

    }

    return {

        isValid: true,

        errors: [],

        record: {

            name: name,

            email: email,

            surface: sanitizeText(payload.pieceSurface, INPUT_LIMITS.maxShortTextLength),

            idea: idea,

            occasion: sanitizeText(payload.pieceOccasion, INPUT_LIMITS.maxShortTextLength),

            referencedPiece: sanitizeText(payload.referencedPiece, INPUT_LIMITS.maxShortTextLength),

            source: sanitizeText(payload.source, INPUT_LIMITS.maxSourceLength) || 'unknown'

        }

    };

}
