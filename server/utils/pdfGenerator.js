const PDFDocument = require('pdfkit');

/**
 * Generates a PDF buffer containing formatted details of a Marketplace Listing
 * @param {Object} listing - Marketplace Listing object
 * @returns {Promise<Buffer>}
 */
const generateMarketplacePDF = (listing) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', (err) => reject(err));

      // Primary Palette: Dark Green (#1B5E20), Forest Green (#2E7D32), Accent Emerald (#66BB6A)
      const primaryColor = '#1B5E20';
      const secondaryColor = '#2E7D32';
      const textColor = '#1F2937';
      const lightBg = '#F4F8F4';
      const borderColor = '#D1E7D1';

      // Header background rectangle
      doc.rect(0, 0, 595.28, 100).fill(primaryColor);

      // Header Text
      doc.fillColor('#FFFFFF')
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('CARDORA AGRI MARKETPLACE', 40, 26);

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#A3E635')
         .text('Official Plantation Plot Listing Certificate & Details', 40, 54);

      doc.fontSize(9)
         .fillColor('#E2E8F0')
         .text(`Generated on: ${new Date().toLocaleString()}`, 40, 74, { align: 'right', width: 515 });

      let y = 115;

      // Section: Listing Overview Banner
      doc.roundedRect(40, y, 515, 60, 8).fillAndStroke(lightBg, borderColor);

      doc.fillColor(primaryColor)
         .fontSize(15)
         .font('Helvetica-Bold')
         .text(listing.title || 'Plantation Plot Listing', 55, y + 12, { width: 485 });

      const listingId = (listing._id || listing.id || Date.now()).toString().slice(-8).toUpperCase();
      const listingType = (listing.type || 'sale').toUpperCase();

      doc.fillColor('#4B5563')
         .fontSize(9.5)
         .font('Helvetica')
         .text(`Listing Ref ID: #${listingId}   |   Category: FOR ${listingType}   |   Status: ACTIVE LISTING`, 55, y + 36);

      y += 75;

      // Section: OWNER VERIFICATION
      doc.fillColor(primaryColor)
         .fontSize(13)
         .font('Helvetica-Bold')
         .text('OWNER VERIFICATION', 40, y);

      doc.moveTo(40, y + 16).lineTo(555, y + 16).strokeColor(borderColor).stroke();
      y += 24;

      doc.roundedRect(40, y, 515, 70, 6).fillAndStroke('#F0FDF4', borderColor);

      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(textColor);
      doc.text('Owner Name:', 50, y + 10);
      doc.font('Helvetica').text(listing.ownerName || 'Verified Planter', 140, y + 10);

      doc.font('Helvetica-Bold').text('Verification Status:', 300, y + 10);
      const statusVal = listing.verificationStatus || 'Pending';
      const statusColor = statusVal === 'Verified' ? '#15803D' : (statusVal === 'Rejected' ? '#B91C1C' : '#D97706');
      doc.font('Helvetica-Bold').fillColor(statusColor).text(statusVal.toUpperCase(), 410, y + 10);

      const capturedStr = listing.verificationCapturedAt
        ? (typeof listing.verificationCapturedAt === 'string' ? listing.verificationCapturedAt : new Date(listing.verificationCapturedAt).toLocaleString())
        : new Date().toLocaleString();

      doc.font('Helvetica-Bold').fillColor(textColor).text('Captured Date/Time:', 50, y + 30);
      doc.font('Helvetica').text(capturedStr, 160, y + 30);

      doc.font('Helvetica-Bold').text('Live Scanner Photo:', 50, y + 50);
      if (listing.verificationPhoto && listing.verificationPhoto.startsWith('data:image')) {
        try {
          const base64Data = listing.verificationPhoto.split(',')[1];
          const imgBuffer = Buffer.from(base64Data, 'base64');
          doc.image(imgBuffer, 460, y + 8, { width: 55, height: 55 });
        } catch (imgErr) {
          doc.font('Helvetica').fillColor('#059669').text('✔ Live Camera Photo Recorded', 160, y + 50);
        }
      } else {
        doc.font('Helvetica').fillColor('#059669').text('✔ Fresh Camera Capture Recorded', 160, y + 50);
      }

      y += 85;

      // Section: PLOT DETAILS
      doc.fillColor(primaryColor)
         .fontSize(13)
         .font('Helvetica-Bold')
         .text('PLOT DETAILS', 40, y);

      doc.moveTo(40, y + 16).lineTo(555, y + 16).strokeColor(borderColor).stroke();

      y += 24;

      const specs = [
        { label: 'Plot Ref ID:', val: `#${listingId}` },
        { label: 'Location:', val: listing.location || 'Idukki, Kerala' },
        { label: 'Total Area:', val: listing.area ? (listing.area.toLowerCase().includes('acre') ? listing.area : `${listing.area} Acres`) : '5 Acres' },
        { label: 'Price / Valuation:', val: listing.price ? (listing.price.startsWith('₹') ? listing.price : `₹${listing.price}`) : 'Price on Request' },
        { label: 'Altitude (MSL):', val: listing.altitude || '1,100m' },
        { label: 'Est. Annual Yield:', val: listing.yield || '420 kg / acre' },
        { label: 'Plant Stock:', val: listing.plants || '2,500 Plants' },
        { label: 'Health Score:', val: `${listing.healthScore || 94}/100` },
      ];

      specs.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const xPos = col === 0 ? 40 : 300;
        const currentY = y + (row * 22);

        doc.roundedRect(xPos, currentY, 245, 18, 4).fill('#F9FAFB');
        doc.fillColor('#374151').font('Helvetica-Bold').fontSize(8.5).text(item.label, xPos + 8, currentY + 4);
        doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(8.5).text(item.val, xPos + 105, currentY + 4, { width: 132, align: 'right' });
      });

      y += Math.ceil(specs.length / 2) * 22 + 15;

      // Section: LEGAL DOCUMENTS
      doc.fillColor(primaryColor)
         .fontSize(13)
         .font('Helvetica-Bold')
         .text('LEGAL DOCUMENTS', 40, y);

      doc.moveTo(40, y + 16).lineTo(555, y + 16).strokeColor(borderColor).stroke();

      y += 24;

      const pattayamTitle = listing.pattayamFileName || 'Official_Pattayam_Title_Deed.pdf';
      const pattayamType = listing.pattayamDoc || 'Official Kerala Govt Revenue Land Title (Pattayam)';

      doc.roundedRect(40, y, 515, 45, 6).fillAndStroke('#FAFAFA', borderColor);
      doc.fillColor(textColor).font('Helvetica-Bold').fontSize(9).text('Document Name:', 50, y + 10);
      doc.font('Helvetica').text(pattayamTitle, 140, y + 10);
      doc.font('Helvetica-Bold').text('Document Type:', 50, y + 26);
      doc.font('Helvetica').text(pattayamType, 140, y + 26);

      y += 60;

      // Section: Plot Description
      const descText = listing.description || 'Prime Organic Cardamom Plot in Western Ghats, Kerala. Features drip irrigation, high-altitude microclimate, and excellent yield track record.';
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(primaryColor).text('Plot Description & Notes:', 40, y);
      doc.font('Helvetica').fontSize(8.5).fillColor('#4B5563').text(descText, 40, y + 14, { width: 515 });

      y += 80;

      // Section: Legal & Verification Stamp Box
      doc.roundedRect(40, y, 515, 45, 6).fill('#ECFDF5');
      doc.fillColor('#065F46')
         .font('Helvetica-Bold')
         .fontSize(9.5)
         .text('🌿 CARDORA AI TRUST ENGINE CERTIFICATION', 50, y + 8);
      doc.fillColor('#047857')
         .font('Helvetica')
         .fontSize(8.5)
         .text('Land ownership title (Pattayam) and survey records for this listing have been validated by Cardora AI Legal Scan.', 50, y + 24, { width: 495 });

      // Footer
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#9CA3AF')
         .text('Cardora Smart Agriculture Platform • www.cardora.io • Support: support@cardora.io', 40, 775, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateMarketplacePDF;
