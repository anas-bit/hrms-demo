import { useParams, useNavigate } from "react-router-dom"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { MOCK_INVOICES } from "../../services/mockData"
import { ArrowLeft, Download, Mail, Printer } from "lucide-react"
import { format } from "date-fns"

export function InvoiceDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    // In a real app, fetch by ID. Here we mock find.
    const invoice = MOCK_INVOICES.find(inv => inv.id === id) || MOCK_INVOICES[0] // Fallback for demo if id not found in static list

    if (!invoice) return <div>Invoice not found</div>

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/app/finance")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Invoice {invoice.id}</h1>
                <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'warning' : 'destructive'}>
                    {invoice.status.toUpperCase()}
                </Badge>
            </div>

            <div className="flex gap-4">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Invoice Details</CardTitle>
                        <CardDescription>Issued on {format(invoice.date, 'PPP')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-muted-foreground font-medium uppercase">Bill To</div>
                                <div className="font-semibold text-lg mt-1">{invoice.client}</div>
                                <div className="text-sm text-slate-500">123 Business Rd, Tech City</div>
                                <div className="text-sm text-slate-500">VAT: US-9928371</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground font-medium uppercase">Pay To</div>
                                <div className="font-semibold text-lg mt-1">Nexus Corp</div>
                                <div className="text-sm text-slate-500">88 Innovation Ave, San Francisco</div>
                                <div className="text-sm text-slate-500">Bank: SVB (Checking)</div>
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-center">Qty</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Professional Services - {format(invoice.date, 'MMMM')}</TableCell>
                                    <TableCell className="text-center">1</TableCell>
                                    <TableCell className="text-right">${(invoice.amount * 0.8).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${(invoice.amount * 0.8).toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Server Hosting Fees</TableCell>
                                    <TableCell className="text-center">1</TableCell>
                                    <TableCell className="text-right">${(invoice.amount * 0.2).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${(invoice.amount * 0.2).toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${invoice.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (0%)</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between text-base font-bold pt-2 border-t">
                                    <span>Total Due</span>
                                    <span>${invoice.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 flex justify-end gap-2 p-4">
                        <Button variant="outline">
                            <Printer className="w-4 h-4 mr-2" /> Print
                        </Button>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" /> PDF
                        </Button>
                        <Button>
                            <Mail className="w-4 h-4 mr-2" /> Send to Client
                        </Button>
                    </CardFooter>
                </Card>

                <div className="w-80 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Payment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">No payments recorded.</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500">Please include invoice number in wire transfer memo.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
