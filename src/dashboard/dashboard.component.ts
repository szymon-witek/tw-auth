import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RecordService } from '../service/command.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../environment'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatPaginatorModule, 
    FormsModule, 
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {

    private apiUrl = environment.apiBaseUrl;

  currentTab: 'active' | 'removed' = 'active';

  displayedColumns = [
    'select',
    'commandId',
    'attackType',
    'sendTimeMin',
    'sendTimeMax',
    'arriveTime',
    'source',
    'target',
    'orderPos',
    'orderSnob',
    'url'
  ];
  dataSource = new MatTableDataSource<any>([]);
  searchKey: string = '';
  selection = new SelectionModel<any>(true, []);

  allRecords: any[] = [];
  activeRecords: any[] = [];
  removedRecords: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private recordService: RecordService, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.dataSource.filterPredicate = (data, filter) => {
      const dataStr = Object.values(data).join(' ').toLowerCase();
      return dataStr.includes(filter);
    };
    this.loadAllRecords();
  }
  

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.sort.active = 'sendTimeMin'; // <-- must match matColumnDef
    this.sort.direction = 'asc'; // or 'desc'
    this.sort.sortChange.emit(); // <-- IMPORTANT to trigger UI update
    this.cdr.detectChanges(); // Tell Angular to re-check

  }
  
  loadAllRecords() {
    this.recordService.getRecords().subscribe(records => {
      console.log('Fetched records:', records); // 👈 Add this
      this.allRecords = records;
      this.splitRecords();
    });
  }
  
  
  splitRecords() {
    this.activeRecords = this.allRecords.filter(r => r.commandStatus?.trim().toUpperCase() === 'ACTIVE' || r.commandStatus?.trim().toUpperCase() === 'LATE');
    this.removedRecords = this.allRecords.filter(r => r.commandStatus?.trim().toUpperCase() === 'REMOVED');
    this.updateDataSource();
  }
  

  changeTab(tab: 'active' | 'removed') {
    this.currentTab = tab;
    this.updateDataSource();
    this.selection.clear();
  }

  updateDataSource() {
    const records = this.currentTab === 'active' ? this.activeRecords : this.removedRecords;
    this.dataSource.data = records;
  
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();  // <<< Add this
    }
  }
  

  openTabs() {
    const currentPageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    const startIndex = currentPageIndex * pageSize;
    const endIndex = startIndex + pageSize;
  
    const currentPageData = this.dataSource.filteredData.slice(startIndex, endIndex);
    const tabsToOpen = currentPageData.slice(0, 10).filter(row => row.url);
  
    if (tabsToOpen.length === 0) return;
  
    let delay = 0;
  
    tabsToOpen.forEach(row => {
      const preloadLink = new Image();
      preloadLink.src = row.url;
    });
  
    tabsToOpen.forEach((row, index) => {
      const randomDelay = Math.floor(Math.random() * (700 - 400 + 1)) + 400;
  
      setTimeout(() => {
        window.open(row.url, '_blank');
      }, delay);
  
      delay += randomDelay;
  
      if (index >= 4) {
        delay += 600;
      }
    });
  }

  isLate(wysylka: string | undefined): boolean {
    if (!wysylka || !wysylka.includes(' ')) return false;
    const [datePart, timeRange] = wysylka.split(' ');
    if (!datePart || !timeRange) return false;
    console.log('timeRange:', timeRange);

    const endDateTimeStr = `${datePart}T${timeRange}`;
    const end = new Date(endDateTimeStr);
    return new Date() > end;  
  }
  tooEarly(wysylka: string | undefined): boolean {
    if (!wysylka || !wysylka.includes(' ')) return false;
    const [datePart, timeRange] = wysylka.split(' ');
    if (!datePart || !timeRange) return false;
    console.log('timeRange:', timeRange);

    const endDateTimeStr = `${datePart}T${timeRange}`;
    const start = new Date(endDateTimeStr);
    return new Date() < start;  
  }
  

  applyFilter() {
    this.dataSource.filter = this.searchKey.trim().toLowerCase();
  
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();  // <<< Add this
    }
  }
  

  clearSearch() {
    this.searchKey = '';
    this.applyFilter();
  }

 
  getCurrentPageData() {
    let currentPageData: any[] = [];
    this.dataSource.connect().subscribe(data => {
      currentPageData = data;
    }).unsubscribe();
    return currentPageData;
  }
  
  

  
  
  

  isAllSelected() {
    const page = this.getCurrentPageData();
    return page.length > 0 && page.every(row => this.selection.isSelected(row));
  }
  
  masterToggle() {
    const page = this.getCurrentPageData();
    const allSelected = this.isAllSelected();
    
    page.forEach(row => {
      if (allSelected) {
        this.selection.deselect(row);
      } else {
        this.selection.select(row);
      }
    });
  }
  
  
  
  

  updateSelected() {
    const selectedCommandIds = this.selection.selected.map(row => row.commandId);
    if (selectedCommandIds.length === 0) return;
  
    const newStatus = this.currentTab === 'active' ? 'REMOVED' : 'ACTIVE';
  
    const params = new HttpParams()
      .set('commandIds', selectedCommandIds.join(','))
      .set('status', newStatus);
  
    const yourJwtToken = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${yourJwtToken}`
    });
 
    this.http.put(this.apiUrl + '/update-commands', null, { params, headers, responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Update successful:', response);
          this.allRecords.forEach(record => {
            if (selectedCommandIds.includes(record.commandId)) {  // NO .toString()
              record.commandStatus = newStatus; // <<< not record.status !!
            }
          });
          this.splitRecords();
          this.selection.clear();
          
        },
        error: (error) => {
          console.error('Error updating:', error);
        }
      });
  }
  
  
  
  get activeCount(): number {
    return this.activeRecords.length;
  }

  get removedCount(): number {
    return this.removedRecords.length;
  }
}
