export class ReportGenerator {
  constructor(database) {
    this.db = database;
    this.MAX_USER_ITEM_VALUE = 500;
    this.PRIORITY_THRESHOLD = 1000;
  }

  generateReport(reportType, user, items) {
    const filteredItems = this.filterItemsByUserRole(user, items);
    const processedItems = this.processItemsForUser(user, filteredItems);
    const header = this.generateHeader(reportType, user);
    const body = this.generateBody(reportType, user, processedItems);
    const footer = this.generateFooter(reportType, this.calculateTotal(processedItems));

    return (header + body + footer).trim();
  }

  filterItemsByUserRole(user, items) {
    if (user.role === 'ADMIN') {
      return items;
    }
    return items.filter(item => item.value <= this.MAX_USER_ITEM_VALUE);
  }

  processItemsForUser(user, items) {
    if (user.role === 'ADMIN') {
      return items.map(item => ({
        ...item,
        priority: item.value > this.PRIORITY_THRESHOLD,
      }));
    }
    return items;
  }

  calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.value, 0);
  }

  generateHeader(reportType, user) {
    if (reportType === 'CSV') {
      return 'ID,NOME,VALOR,USUARIO\n';
    }
    if (reportType === 'HTML') {
      return `<html><body>
        <h1>Relatório</h1>
        <h2>Usuário: ${user.name}</h2>
        <table>
        <tr><th>ID</th><th>Nome</th><th>Valor</th></tr>
        `;
    }
    return '';
  }

  generateBody(reportType, user, items) {
    return items
      .map(item => this.formatItem(reportType, user, item))
      .join('');
  }

  formatItem(reportType, user, item) {
    if (reportType === 'CSV') {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    }
    if (reportType === 'HTML') {
      const style = item.priority ? ' style="font-weight:bold;"' : '';
      return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    }
    return '';
  }

  generateFooter(reportType, total) {
    if (reportType === 'CSV') {
      return `\nTotal,,\n${total},,\n`;
    }
    if (reportType === 'HTML') {
      return `</table>
<h3>Total: ${total}</h3>
</body></html>
`;
    }
    return '';
  }
}

