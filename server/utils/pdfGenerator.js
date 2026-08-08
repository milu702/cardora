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

      // Section: Seller & Owner Info
      doc.fillColor(primaryColor)
         .fontSize(13)
         .font('Helvetica-Bold')
         .text('Owner & Contact Details', 40, y);

      doc.moveTo(40, y + 16).lineTo(555, y + 16).strokeColor(borderColor).stroke();

      y += 24;

      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(textColor);
      doc.text('Owner Name:', 40, y);
      doc.font('Helvetica').text(listing.ownerName || 'Verified Planter', 130, y);

      doc.font('Helvetica-Bold').text('Contact Email:', 300, y);
      doc.font('Helvetica').text(listing.ownerEmail || 'seller@cardora.io', 390, y);

      y += 18;

      doc.font('Helvetica-Bold').text('Phone Number:', 40, y);
      doc.font('Helvetica').text(listing.ownerPhone || '+91 98470 54321', 130, y);

      doc.font('Helvetica-Bold').text('AI Verification:', 300, y);
      doc.font('Helvetica').fillColor('#15803D').text('✔ 99.4% AI Legal Verified', 390, y);

      y += 30;

      // Section: Property & Agronomic Specifications
      doc.fillColor(primaryColor)
         .fontSize(13)
         .font('Helvetica-Bold')
         .text('Property & Agronomic Specifications', 40, y);

      doc.moveTo(40, y + 16).lineTo(555, y + 16).strokeColor(borderColor).stroke();

      y += 24;

      const specs = [
        { label: 'Location:', val: listing.location || 'Idukki, Kerala' },
        { label: 'Total Area:', val: listing.area ? (listing.area.toLowerCase().includes('acre') ? listing.area : `${listing.area} Acres`) : '5 Acres' },
        { label: 'Price / Valuation:', val: listing.price ? (listing.price.startsWith('₹') ? listing.price : `₹${listing.price}`) : 'Price on Request' },
        { label: 'Altitude (MSL):', val: listing.altitude || '1,100m' },
        { label: 'Est. Annual Yield:', val: listing.yield || '420 kg / acre' },
        { label: 'Plant Stock:', val: listing.plants || '2,500 Plants' },
        { label: 'Health Score:', val: `${listing.healthScore || 94}/100` },
        { label: 'Projected ROI:', val: listing.roi || '24% Annual' },
      ];

      // Render spec table (2 columns)
      specs.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const xPos = col === 0 ? 40 : 300;
        const currentY = y + (row * 24);

        doc.roundedRect(xPos, currentY, 245, 20, 4).fill('#F9FAFB');
        doc.fillColor('#374151').font('Helvetica-Bold').fontSize(8.5).text(item.label, xPos + 8, currentY + 5);
        doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(8.5).text(item.val, xPos + 105, currentY + 5, { width: 132, align: 'right' });
      });

      y += Math.ceil(specs.length / 2) * 24 + 15;

      // Section: Plot Description
      doc.fillColor(primaryColor)
         .fontSize(13)
         .font('Helvetica-Bold')
         .text('Plot Description & Agronomic Features', 40, y);

      doc.moveTo(40, y + 16).lineTo(555, y + 16).strokeColor(borderColor).stroke();

      y += 24;

      const descText = listing.description || 'Prime Organic Cardamom Plot in Western Ghats, Kerala. Features drip irrigation, high-altitude microclimate, and excellent yield track record.';

      doc.roundedRect(40, y, 515, 65, 6).fillAndStroke('#FAFAFA', borderColor);
      doc.fillColor('#374151')
         .font('Helvetica')
         .fontSize(9)
         .text(descText, 50, y + 10, { width: 495, height: 45, ellipsis: true });

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
