package com.nexora.backend.service;

import com.nexora.backend.dto.WarehouseRequest;
import com.nexora.backend.dto.WarehouseResponse;
import com.nexora.backend.entity.Warehouse;
import com.nexora.backend.repository.WarehouseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class WarehouseService {
    private final WarehouseRepository repository;

    public WarehouseService(WarehouseRepository repository) {
        this.repository = repository;
    }

    public List<WarehouseResponse> findAll() {
        return repository.findAll().stream()
                .map(WarehouseResponse::from)
                .toList();
    }

    public WarehouseResponse findById(Long id) {
        return WarehouseResponse.from(getWarehouse(id));
    }

    @Transactional
    public WarehouseResponse create(WarehouseRequest request) {
        String name = request.name().trim();
        ensureNameAvailable(name, null);

        Warehouse warehouse = new Warehouse(name, request.address());
        if (Boolean.FALSE.equals(request.active())) {
            warehouse.deactivate();
        }

        return WarehouseResponse.from(repository.save(warehouse));
    }

    @Transactional
    public WarehouseResponse update(Long id, WarehouseRequest request) {
        Warehouse warehouse = getWarehouse(id);
        String name = request.name().trim();
        ensureNameAvailable(name, id);

        warehouse.updateDetails(name, request.address());
        if (Boolean.FALSE.equals(request.active())) {
            warehouse.deactivate();
        } else if (Boolean.TRUE.equals(request.active())) {
            warehouse.activate();
        }

        return WarehouseResponse.from(repository.save(warehouse));
    }

    @Transactional
    public void delete(Long id) {
        Warehouse warehouse = getWarehouse(id);
        warehouse.deactivate();
        repository.save(warehouse);
    }

    private Warehouse getWarehouse(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Warehouse not found"));
    }

    private void ensureNameAvailable(String name, Long exceptId) {
        boolean exists = exceptId == null
                ? repository.existsByNameIgnoreCase(name)
                : repository.existsByNameIgnoreCaseAndIdNot(name, exceptId);

        if (exists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Warehouse name already exists"
            );
        }
    }
}
