import { MlsExcelAppPage } from './app.po';

describe('mls-excel-app App', () => {
  let page: MlsExcelAppPage;

  beforeEach(() => {
    page = new MlsExcelAppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
