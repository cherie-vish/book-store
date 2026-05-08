import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: 1, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 10, color: '#666' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, backgroundColor: '#f0f0f0', padding: 5 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#e0e0e0', padding: 8, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc', padding: 8 },
  productCol: { flex: 3 },
  qtyCol: { flex: 1, textAlign: 'center' },
  priceCol: { flex: 1, textAlign: 'right' },
  totalCol: { flex: 1, textAlign: 'right' },
  footer: { marginTop: 30, borderTop: 1, paddingTop: 10, fontSize: 10, textAlign: 'center', color: '#666' },
  bold: { fontWeight: 'bold' },
});

interface InvoicePDFProps {
  order: {
    id: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    customerAddress: string;
    total: number;
    status: string;
    createdAt: string;
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
    }>;
  };
}

export function InvoicePDF({ order }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>BookStore</Text>
          <Text style={styles.subtitle}>123 Book Street, New York, NY 10001</Text>
          <Text style={styles.subtitle}>Email: support@bookstore.com | Phone: +1 234 567 890</Text>
        </View>

        {/* Invoice Info */}
        <View style={styles.row}>
          <View>
            <Text>Invoice #: INV-{order.id.toString().padStart(6, '0')}</Text>
            <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
          </View>
          <View>
            <Text>Order #: #{order.id}</Text>
            <Text>Status: {order.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Billing Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text>{order.customerName}</Text>
          <Text>{order.customerEmail}</Text>
          {order.customerPhone && <Text>{order.customerPhone}</Text>}
          <Text>{order.customerAddress}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.productCol}>Product</Text>
            <Text style={styles.qtyCol}>Qty</Text>
            <Text style={styles.priceCol}>Price</Text>
            <Text style={styles.totalCol}>Total</Text>
          </View>

          {/* Rows */}
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.productCol}>{item.productName}</Text>
              <Text style={styles.qtyCol}>{item.quantity}</Text>
              <Text style={styles.priceCol}>${item.price.toFixed(2)}</Text>
              <Text style={styles.totalCol}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={[styles.row, { marginTop: 10 }]}>
          <View />
          <View style={{ width: 200 }}>
            <View style={[styles.row, { marginBottom: 5 }]}>
              <Text>Subtotal:</Text>
              <Text>${order.total.toFixed(2)}</Text>
            </View>
            <View style={[styles.row, { marginBottom: 5 }]}>
              <Text>Shipping:</Text>
              <Text>$0.00</Text>
            </View>
            <View style={[styles.row, styles.bold, { borderTopWidth: 1, paddingTop: 5 }]}>
              <Text style={styles.bold}>Total:</Text>
              <Text style={styles.bold}>${order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for shopping with BookStore!</Text>
          <Text>For support, contact support@bookstore.com</Text>
        </View>
      </Page>
    </Document>
  );
}