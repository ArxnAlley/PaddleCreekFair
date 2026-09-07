/* ============================================================
   RESPONSE SERVICE
   JSON response construction for the Web App endpoint.

   No spreadsheet data is ever returned to the browser, and
   neither is the discount code. PADDLE10 reaches the customer
   in their email and nowhere else — not in the page, and not in
   a response body a curious visitor could read in devtools.
============================================================ */

/**
 * Wraps a response object as a JSON ContentService output.
 */
function createJsonOutput(responseObject)
{

    return ContentService
        .createTextOutput(JSON.stringify(responseObject))
        .setMimeType(ContentService.MimeType.JSON);

}

/**
 * Builds the discount-signup success response.
 *
 *     {
 *         "success": true,
 *         "submissionType": "discountSignup",
 *         "message": "...",
 *         "alreadySignedUp": false,
 *         "emailSent": true
 *     }
 */
function buildDiscountSuccessResponse(message, alreadySignedUp, emailSent)
{

    return createJsonOutput({

        success: true,

        submissionType: SUBMISSION_TYPES.DISCOUNT,

        message: message,

        alreadySignedUp: Boolean(alreadySignedUp),

        emailSent: Boolean(emailSent)

    });

}

/**
 * Builds the commission-inquiry success response.
 *
 * The inquiry reference is the customer's own, so it is safe to
 * hand back and useful if they want to quote it.
 */
function buildCommissionSuccessResponse(message, inquiryId, emailSent)
{

    return createJsonOutput({

        success: true,

        submissionType: SUBMISSION_TYPES.COMMISSION,

        message: message,

        inquiryId: inquiryId || '',

        emailSent: Boolean(emailSent)

    });

}

/**
 * Builds the standard error response.
 */
function buildErrorResponse(message, errors)
{

    return createJsonOutput({

        success: false,

        message: message || 'Something went wrong. Please try again.',

        errors: errors || []

    });

}
